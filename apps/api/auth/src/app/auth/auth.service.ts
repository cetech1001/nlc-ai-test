import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { TokenService } from './services/token.service';
import { AdminAuthService } from './services/admin-auth.service';
import { CoachAuthService } from './services/coach-auth.service';
import { ClientAuthService } from './services/client-auth.service';
import {
  AuthEvent,
  UserType,
  LoginRequest,
  RegistrationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UpdatePasswordRequest,
  VerifyCodeRequest,
  ClientRegistrationRequest,
} from '@nlc-ai/api-types';
import * as bcrypt from 'bcryptjs';
import {Admin, Client, Coach} from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly tokenService: TokenService,
    private readonly adminAuthService: AdminAuthService,
    private readonly coachAuthService: CoachAuthService,
    private readonly clientAuthService: ClientAuthService,
  ) {}

  // ========== DELEGATED AUTH METHODS ==========
  async loginAdmin(loginDto: LoginRequest) {
    return this.adminAuthService.login(loginDto);
  }

  async registerCoach(registerDto: RegistrationRequest) {
    return this.coachAuthService.register(registerDto);
  }

  async loginCoach(loginDto: LoginRequest) {
    return this.coachAuthService.login(loginDto);
  }

  async registerClient(registerDto: ClientRegistrationRequest) {
    return this.clientAuthService.register(registerDto);
  }

  async loginClient(loginDto: LoginRequest) {
    return this.clientAuthService.login(loginDto);
  }

  async switchCoachContext(clientID: string, newCoachID: string) {
    return this.clientAuthService.switchCoachContext(clientID, newCoachID);
  }

  // ========== COMMON METHODS ==========
  async uploadAvatar(userID: string, userType: UserType, file: Express.Multer.File) {
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

      // Delegate to specific service for database update
      if (userType === UserType.coach) {
        await this.coachAuthService.uploadAvatar(userID, avatarUrl);
      } else if (userType === UserType.admin) {
        await this.adminAuthService.uploadAvatar(userID, avatarUrl);
      } else if (userType === UserType.client) {
        await this.clientAuthService.uploadAvatar(userID, avatarUrl);
      }

      // Emit avatar updated event
      await this.outbox.saveAndPublishEvent<AuthEvent>(
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

  async updateProfile(userID: string, userType: UserType, updateProfileDto: UpdateProfileRequest) {
    let result;

    // Delegate to specific service
    if (userType === UserType.coach) {
      result = await this.coachAuthService.updateProfile(userID, updateProfileDto);
    } else if (userType === UserType.admin) {
      result = await this.adminAuthService.updateProfile(userID, updateProfileDto);
    } else if (userType === UserType.client) {
      result = await this.clientAuthService.updateProfile(userID, updateProfileDto);
    } else {
      throw new BadRequestException('Invalid user type');
    }

    // Emit profile updated event
    await this.outbox.saveAndPublishEvent<AuthEvent>(
      {
        eventType: userType === UserType.coach ? 'auth.coach.profile.updated' :
          userType === UserType.admin ? 'auth.admin.profile.updated' :
            'auth.client.profile.updated',
        schemaVersion: 1,
        payload: {
          userID,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          ...(userType === UserType.admin && { role: (result.user as Admin).role }),
        },
      },
      `auth.${userType}.profile.updated`
    );

    return result;
  }

  async updatePassword(userID: string, userType: UserType, updatePasswordDto: UpdatePasswordRequest) {
    let result;

    const passwordHash = await bcrypt.hash(updatePasswordDto.newPassword, 12);

    // Delegate to specific service
    if (userType === UserType.coach) {
      result = await this.coachAuthService.updatePassword(passwordHash, userID);
    } else if (userType === UserType.admin) {
      result = await this.adminAuthService.updatePassword(passwordHash, userID);
    } else if (userType === UserType.client) {
      result = await this.clientAuthService.updatePassword(passwordHash, userID);
    } else {
      throw new BadRequestException('Invalid user type');
    }

    // Emit password updated event (without sensitive data)
    await this.outbox.saveAndPublishEvent<AuthEvent>(
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

    return result;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordRequest, userType: UserType) {
    const { email } = forgotPasswordDto;

    let user;
    if (userType === UserType.coach) {
      user = await this.prisma.coach.findUnique({ where: { email } });
    } else if (userType === UserType.admin) {
      user = await this.prisma.admin.findUnique({ where: { email } });
    } else if (userType === UserType.client) {
      user = await this.prisma.client.findUnique({ where: { email } });
    }

    if (!user) {
      // Don't reveal whether user exists
      return { message: 'If the email exists, a verification code has been sent.' };
    }

    const code = this.tokenService.generateVerificationCode();
    await this.tokenService.storeVerificationToken(email, code, 'reset');

    await this.outbox.saveAndPublishEvent<AuthEvent>(
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

    // Check for email verification first
    const isEmailVerification = await this.tokenService.verifyToken(email, code, 'verification');
    if (isEmailVerification) {
      return this.handleEmailVerification(email);
    }

    // Check for password reset
    const isPasswordReset = await this.tokenService.verifyToken(email, code, 'reset');
    if (isPasswordReset) {
      const resetToken = await this.tokenService.generateResetToken(email);
      return {
        resetToken,
        verified: false,
        message: 'Code verified successfully',
      };
    }

    throw new BadRequestException('Invalid or expired verification code');
  }

  async resetPassword(resetPasswordDto: ResetPasswordRequest, userType: UserType) {
    const { token, password } = resetPasswordDto;

    const email = await this.tokenService.validateResetToken(token);
    if (!email) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (userType === UserType.coach) {
      await this.coachAuthService.updatePassword(passwordHash, undefined, email);
    } else if (userType === UserType.admin) {
      await this.adminAuthService.updatePassword(passwordHash, undefined, email);
    } else if (userType === UserType.client) {
      await this.clientAuthService.updatePassword(passwordHash, undefined, email);
    }

    await this.tokenService.invalidateTokens(email);

    // Emit password reset event
    await this.outbox.saveAndPublishEvent<AuthEvent>(
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

    await this.outbox.saveAndPublishEvent<AuthEvent>(
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

  async findUserByID(id: string, type: UserType) {
    if (type === UserType.coach) {
      return this.coachAuthService.findByUserID(id);
    } else if (type === UserType.admin) {
      return this.adminAuthService.findByUserID(id);
    } else if (type === UserType.client) {
      return this.clientAuthService.findByUserID(id);
    }

    return null;
  }

  // ========== PRIVATE HELPER METHODS ==========
  private async handleEmailVerification(email: string) {
    // Try coach first
    let user: Coach | Client | null = await this.prisma.coach.findUnique({ where: { email } });
    if (user && !user.isVerified) {
      return this.coachAuthService.verifyEmail(user);
    }

    // Try client
    user = await this.prisma.client.findUnique({ where: { email } });
    if (user && !user.isVerified) {
      return this.clientAuthService.verifyEmail(user);
    }

    throw new BadRequestException('Invalid verification request');
  }
}
