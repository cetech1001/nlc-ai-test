import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import { TokenService } from './services/token.service';
import { AdminAuthService } from './services/admin-auth.service';
import { CoachAuthService } from './services/coach-auth.service';
import { ClientAuthService } from './services/client-auth.service';
import type { Request } from 'express';
import {
  AuthEvent,
  UserType,
  LoginRequest,
  RegistrationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyCodeRequest,
  ClientRegistrationRequest,
} from '@nlc-ai/types';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly tokenService: TokenService,
    private readonly adminAuthService: AdminAuthService,
    private readonly coachAuthService: CoachAuthService,
    private readonly clientAuthService: ClientAuthService,
  ) {}

  async loginAdmin(loginDto: LoginRequest) {
    return this.adminAuthService.login(loginDto);
  }

  async registerCoach(registerDto: RegistrationRequest) {
    return this.coachAuthService.register(registerDto);
  }

  async loginCoach(loginDto: LoginRequest, req: Request) {
    return this.coachAuthService.login(loginDto, undefined, req);
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


  async forgotPassword(forgotPasswordDto: ForgotPasswordRequest, userType: UserType) {
    const { email } = forgotPasswordDto;

    let user;
    if (userType === UserType.COACH) {
      user = await this.prisma.coach.findUnique({ where: { email } });
    } else if (userType === UserType.ADMIN) {
      user = await this.prisma.admin.findUnique({ where: { email } });
    } else if (userType === UserType.CLIENT) {
      user = await this.prisma.client.findUnique({ where: { email } });
    }

    if (!user) {
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

  async verifyCode(verifyCodeDto: VerifyCodeRequest, req: Request) {
    const { email, code } = verifyCodeDto;

    const isEmailVerification = await this.tokenService.verifyToken(email, code, 'verification');
    if (isEmailVerification) {
      return this.handleEmailVerification(email, req);
    }

    const isPasswordReset = await this.tokenService.verifyToken(email, code, 'reset');
    if (isPasswordReset) {
      await this.prisma.coach.update({
        where: { email },
        data: { isVerified: true }
      });
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

    if (userType === UserType.COACH) {
      await this.coachAuthService.updatePassword(passwordHash, undefined, email);
    } else if (userType === UserType.ADMIN) {
      await this.adminAuthService.updatePassword(passwordHash, undefined, email);
    } else if (userType === UserType.CLIENT) {
      await this.clientAuthService.updatePassword(passwordHash, undefined, email);
    }

    await this.tokenService.invalidateTokens(email);

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

  private async handleEmailVerification(email: string, req: Request) {
    let user: any = await this.prisma.coach.findUnique({ where: { email } });
    if (user && !user.isVerified) {
      return this.coachAuthService.verifyEmail(user, req);
    }

    user = await this.prisma.client.findUnique({ where: { email } });
    if (user && !user.isVerified) {
      return this.clientAuthService.verifyEmail(user);
    }

    throw new BadRequestException('Invalid verification request');
  }
}
