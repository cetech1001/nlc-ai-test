import {Injectable, UnauthorizedException, BadRequestException, ConflictException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { TokenService } from './services/token.service';
import { CloudinaryService } from "../cloudinary/cloudinary.service";

import {
  AUTH_TYPES, ForgotPasswordRequest,
  LoginRequest,
  RegistrationRequest, ResetPasswordRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
  UserType, VerifyCodeRequest
} from "@nlc-ai/types";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async registerCoach(registerDto: RegistrationRequest) {
    const { email, password, fullName } = registerDto;

    const existingCoach = await this.prisma.coach.findUnique({
      where: { email },
    });

    if (existingCoach) {
      throw new ConflictException('Coach with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const coach = await this.prisma.coach.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        isVerified: false,
        isActive: true,
        subscriptionStatus: 'trial',
      },
    });

    await this.sendVerificationEmail(email, 'verification');

    return {
      message: 'Registration successful. Please check your email for verification code.',
      coachID: coach.id,
      requiresVerification: true,
      email: email,
    };
  }

  async loginCoach(loginDto: LoginRequest) {
    const { email, password } = loginDto;

    const coach = await this.validateCoach(email, password);

    if (!coach.isVerified) {
      await this.sendVerificationEmail(email, 'verification');

      throw new UnauthorizedException({
        message: 'Email not verified. Please check your email for verification code.',
        code: 'EMAIL_NOT_VERIFIED',
        email: email,
        requiresVerification: true,
      });
    }

    await this.prisma.coach.update({
      where: { id: coach.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: coach.id,
      email: coach.email,
      type: UserType.coach,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: coach.id,
        email: coach.email,
        firstName: coach.firstName,
        lastName: coach.lastName,
        businessName: coach.businessName,
        isVerified: coach.isVerified,
        avatarUrl: coach.avatarUrl,
      },
    };
  }

  async validateCoach(email: string, password: string) {
    const coach = await this.prisma.coach.findUnique({
      where: { email },
    });

    if (!coach || !coach.isActive || coach.isDeleted) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!coach.passwordHash) {
      throw new UnauthorizedException('Please complete your registration');
    }

    const isPasswordValid = await bcrypt.compare(password, coach.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return coach;
  }

  async loginAdmin(adminLoginDto: LoginRequest) {
    const { email, password } = adminLoginDto;

    const admin = await this.validateAdmin(email, password);

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: admin.id,
      email: admin.email,
      type: UserType.admin,
      role: admin.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        avatarUrl: admin.avatarUrl,
      },
    };
  }

  async validateAdmin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return admin;
  }

  async uploadAvatar(userID: string, userType: AUTH_TYPES, file: Express.Multer.File) {
    try {
      const result = await this.cloudinaryService.uploadAsset(file, {
        resource_type: 'image',
        folder: `nlc-ai/avatars/${userType}s`,
        public_id: `${userID}_avatar`,
        overwrite: true,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      const avatarUrl = result.secure_url;

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
      return { message: 'If the email exists, a verification code has been sent.' };
    }

    await this.sendVerificationEmail(email, 'reset');

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
      await this.prisma.coach.update({
        where: { email },
        data: {
          isVerified: true,
          lastLoginAt: new Date(),
        },
      });

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

    return { message: 'Password reset successfully' };
  }

  async resendCode(email: string, type: 'verification' | 'reset' = 'verification') {
    await this.sendVerificationEmail(email, type);
    return { message: 'Verification code sent' };
  }

  private async sendVerificationEmail(email: string, type: 'verification' | 'reset' = 'verification') {
    const code = this.tokenService.generateVerificationCode();
    await this.tokenService.storeVerificationToken(email, code, type);

    if (type === 'verification') {
      await this.emailService.sendVerificationEmail(email, code);
    } else {
      await this.emailService.sendPasswordResetEmail(email, code);
    }
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
