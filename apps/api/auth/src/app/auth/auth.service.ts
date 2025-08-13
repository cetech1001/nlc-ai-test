import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { TokenService } from './services/token.service';
import {
  AUTH_TYPES,
  UserType,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UpdatePasswordRequest,
  VerifyCodeRequest,
} from '@nlc-ai/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly outbox: OutboxService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly tokenService: TokenService,
  ) {}

  async uploadAvatar(userID: string, userType: AUTH_TYPES, file: Express.Multer.File) {
    try {
      const { secure_url: avatarUrl } = await this.cloudinaryService.uploadAsset(file, {
        resource_type: 'image',
        folder: `nlc-ai/avatars/${userType === 'coach' ? 'coaches' : userType + 's'}`,
        public_id: `${userID}_avatar`,
        overwrite: true,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      if (userType === UserType.coach) {
        await this.prisma.coach.update({
          where: { id: userID },
          data: { avatarUrl, updatedAt: new Date() },
        });
      } else {
        await this.prisma.admin.update({
          where: { id: userID },
          data: { avatarUrl, updatedAt: new Date() },
        });
      }

      // Emit avatar updated event
      await this.outbox.saveAndPublishEvent(
        {
          eventType: 'auth.avatar.updated',
          schemaVersion: 1,
          payload: {
            userID,
            userType,
            avatarUrl,
          },
        },
        'auth.avatar.updated'
      );

      return {
        message: 'Avatar uploaded successfully',
        avatarUrl,
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload avatar');
    }
  }

  async updateProfile(userID: string, userType: AUTH_TYPES, updateProfileDto: UpdateProfileRequest) {
    const { firstName, lastName, email } = updateProfileDto;

    if (userType === UserType.coach) {
      const existingCoach = await this.prisma.coach.findFirst({
        where: {
          email,
          id: { not: userID },
          isActive: true,
        },
      });

      if (existingCoach) {
        throw new ConflictException('Email already exists');
      }

      const updatedCoach = await this.prisma.coach.update({
        where: { id: userID },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          businessName: true,
          isVerified: true,
        },
      });

      // Emit profile updated event
      await this.outbox.saveAndPublishEvent(
        {
          eventType: 'auth.coach.profile.updated',
          schemaVersion: 1,
          payload: {
            coachID: userID,
            email: updatedCoach.email,
            firstName: updatedCoach.firstName,
            lastName: updatedCoach.lastName,
          },
        },
        'auth.coach.profile.updated'
      );

      return {
        message: 'Profile updated successfully',
        user: updatedCoach,
      };
    } else {
      const existingAdmin = await this.prisma.admin.findFirst({
        where: {
          email,
          id: { not: userID },
          isActive: true,
        },
      });

      if (existingAdmin) {
        throw new ConflictException('Email already exists');
      }

      const updatedAdmin = await this.prisma.admin.update({
        where: { id: userID },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      // Emit profile updated event
      await this.outbox.saveAndPublishEvent(
        {
          eventType: 'auth.admin.profile.updated',
          schemaVersion: 1,
          payload: {
            adminID: userID,
            email: updatedAdmin.email,
            firstName: updatedAdmin.firstName,
            lastName: updatedAdmin.lastName,
            role: updatedAdmin.role,
          },
        },
        'auth.admin.profile.updated'
      );

      return {
        message: 'Profile updated successfully',
        user: updatedAdmin,
      };
    }
  }

  async updatePassword(userID: string, userType: AUTH_TYPES, updatePasswordDto: UpdatePasswordRequest) {
    const { newPassword } = updatePasswordDto;

    const passwordHash = await bcrypt.hash(newPassword, 12);

    if (userType === UserType.coach) {
      await this.prisma.coach.update({
        where: { id: userID },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });
    } else {
      await this.prisma.admin.update({
        where: { id: userID },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });
    }

    // Emit password updated event (without sensitive data)
    await this.outbox.saveAndPublishEvent(
      {
        eventType: 'auth.password.updated',
        schemaVersion: 1,
        payload: {
          userID,
          userType,
          updatedAt: new Date().toISOString(),
        },
      },
      'auth.password.updated'
    );

    return { message: 'Password updated successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordRequest, userType: AUTH_TYPES) {
    const { email } = forgotPasswordDto;

    let user;
    if (userType === UserType.coach) {
      user = await this.prisma.coach.findUnique({ where: { email } });
    } else {
      user = await this.prisma.admin.findUnique({ where: { email } });
    }

    if (!user) {
      // Don't reveal whether user exists
      return { message: 'If the email exists, a verification code has been sent.' };
    }

    const code = this.tokenService.generateVerificationCode();
    await this.tokenService.storeVerificationToken(email, code, 'reset');

    await this.outbox.saveAndPublishEvent(
      {
        eventType: 'auth.verification.requested',
        schemaVersion: 1,
        payload: {
          email: email,
          code: code,
          type: 'password_reset',
        },
      },
      'auth.verification.requested'
    );

    return { message: 'Verification code sent to your email.' };
  }

  async verifyCode(verifyCodeDto: VerifyCodeRequest) {
    const { email, code } = verifyCodeDto;

    const isValid = await this.tokenService.verifyToken(email, code, 'verification');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    const user = await this.prisma.coach.findUnique({
      where: { email },
    });

    if (user && !user.isVerified) {
      // Email verification
      await this.prisma.coach.update({
        where: { email },
        data: {
          isVerified: true,
          lastLoginAt: new Date(),
        },
      });

      // Emit verification completed event
      await this.outbox.saveAndPublishEvent(
        {
          eventType: 'auth.coach.verified',
          schemaVersion: 1,
          payload: {
            coachID: user.id,
            email: user.email,
            verifiedAt: new Date().toISOString(),
          },
        },
        'auth.coach.verified'
      );

      const payload = {
        sub: user.id,
        email: user.email,
        type: UserType.coach,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          avatarUrl: user.avatarUrl,
          isVerified: true,
        },
        verified: true,
        message: 'Email verified successfully',
      };
    } else {
      // Password reset verification
      const resetToken = await this.tokenService.generateResetToken(email);
      return {
        resetToken,
        verified: false,
        message: 'Code verified successfully',
      };
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordRequest, userType: AUTH_TYPES) {
    const { token, password } = resetPasswordDto;

    const email = await this.tokenService.validateResetToken(token);
    if (!email) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (userType === UserType.coach) {
      await this.prisma.coach.update({
        where: { email },
        data: { passwordHash },
      });
    } else {
      await this.prisma.admin.update({
        where: { email },
        data: { passwordHash },
      });
    }

    await this.tokenService.invalidateTokens(email);

    // Emit password reset event
    await this.outbox.saveAndPublishEvent(
      {
        eventType: 'auth.password.reset',
        schemaVersion: 1,
        payload: {
          email: email,
          userType: userType,
          resetAt: new Date().toISOString(),
        },
      },
      'auth.password.reset'
    );

    return { message: 'Password reset successfully' };
  }

  async resendCode(email: string, type: 'verification' | 'reset' = 'verification') {
    const code = this.tokenService.generateVerificationCode();
    await this.tokenService.storeVerificationToken(email, code, type);

    await this.outbox.saveAndPublishEvent(
      {
        eventType: 'auth.verification.requested',
        schemaVersion: 1,
        payload: {
          email: email,
          code: code,
          type: type === 'verification' ? 'email_verification' : 'password_reset',
        },
      },
      'auth.verification.requested'
    );

    return { message: 'Verification code sent' };
  }

  async findUserByID(id: string, type: AUTH_TYPES) {
    if (type === UserType.coach) {
      return this.prisma.coach.findUnique({
        where: { id, isActive: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          businessName: true,
          isVerified: true,
          avatarUrl: true,
          websiteUrl: true,
          bio: true,
          timezone: true,
          phone: true,
        },
      });
    } else {
      return this.prisma.admin.findUnique({
        where: { id, isActive: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatarUrl: true,
        },
      });
    }
  }
}
