import {Injectable, ConflictException, UnauthorizedException, BadRequestException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@nlc-ai/api-database';
import { TokenService } from './token.service';
import { OutboxService } from '@nlc-ai/api-messaging';
import {
  AuthEvent,
  LoginRequest,
  RegistrationRequest,
  UpdateProfileRequest,
  UserType,
  ValidatedGoogleUser,
} from '@nlc-ai/api-types';
import {Coach} from "@prisma/client";

@Injectable()
export class CoachAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly outbox: OutboxService,
    private readonly jwtService: JwtService,
  ) {}

  // STANDARDIZED LOGIN FLOW
  async login(loginDto: LoginRequest, provider?: 'google') {
    const { email, password } = loginDto;

    const coach = await this.findCoachByEmail(email);

    // Check if user exists
    if (!coach) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is active
    if (!coach.isActive || coach.isDeleted) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Validate authentication method
    if (provider === 'google') {
      if (coach.provider !== 'google') {
        throw new UnauthorizedException({
          code: 'ACCOUNT_CONFLICT',
          message: 'Account exists with different authentication method',
        });
      }
    } else {
      // Email/password login
      if (coach.provider && !coach.passwordHash) {
        throw new UnauthorizedException({
          code: 'ACCOUNT_CONFLICT',
          message: 'Account exists with different authentication method',
        });
      }

      if (!coach.passwordHash) {
        throw new UnauthorizedException('Please complete your registration');
      }

      const isPasswordValid = await bcrypt.compare(password, coach.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    // Check email verification
    if (!coach.isVerified) {
      const code = this.tokenService.generateVerificationCode();
      await this.tokenService.storeVerificationToken(email, code, 'verification');

      await this.outbox.saveAndPublishEvent<AuthEvent>(
        {
          eventType: 'auth.verification.requested',
          schemaVersion: 1,
          payload: {
            email: coach.email,
            code: code,
            type: 'email_verification',
          },
        },
        'auth.verification.requested'
      );

      throw new UnauthorizedException({
        message: 'Email not verified. Please check your email for verification code.',
        code: 'EMAIL_NOT_VERIFIED',
        email: email,
        requiresVerification: true,
      });
    }

    // Successful login - update last login
    await this.prisma.coach.update({
      where: { id: coach.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateAuthResponse(coach, false);
  }

  // STANDARDIZED REGISTRATION FLOW
  async register(registerDto: RegistrationRequest, provider?: 'google', googleData?: ValidatedGoogleUser) {
    const { email, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingCoach = await this.findCoachByEmail(email);
    if (existingCoach) {
      throw new ConflictException('Coach with this email already exists');
    }

    let coachData: any = {
      email,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      isActive: true,
      subscriptionStatus: 'trial',
    };

    if (provider === 'google' && googleData) {
      // Google registration
      coachData = {
        ...coachData,
        avatarUrl: googleData.avatarUrl,
        isVerified: true, // Google accounts are pre-verified
        provider: 'google',
        providerID: googleData.providerID,
      };
    } else {
      // Email/password registration
      const { password } = registerDto;
      const passwordHash = await bcrypt.hash(password, 12);
      coachData = {
        ...coachData,
        passwordHash,
        isVerified: false,
      };
    }

    const coach = await this.prisma.coach.create({
      data: coachData,
    });

    // Send verification email for email/password registration
    if (provider !== 'google') {
      const code = this.tokenService.generateVerificationCode();
      await this.tokenService.storeVerificationToken(email, code, 'verification');

      await this.outbox.saveAndPublishEvent<AuthEvent>(
        {
          eventType: 'auth.verification.requested',
          schemaVersion: 1,
          payload: {
            email: coach.email,
            code: code,
            type: 'email_verification',
          },
        },
        'auth.verification.requested'
      );
    }

    // Emit registration event
    await this.outbox.saveAndPublishEvent<AuthEvent>(
      {
        eventType: 'auth.coach.registered',
        schemaVersion: 1,
        payload: {
          coachID: coach.id,
          email: coach.email,
          firstName: coach.firstName,
          lastName: coach.lastName,
        },
      },
      'auth.coach.registered'
    );

    if (provider === 'google') {
      // Auto-login for Google registration
      return this.generateAuthResponse(coach, true);
    }

    return {
      message: 'Registration successful. Please check your email for verification code.',
      coachID: coach.id,
      requiresVerification: true,
      email: email,
    };
  }

  // GOOGLE AUTH ENTRY POINT
  async googleAuth(googleUser: ValidatedGoogleUser) {
    const existingCoach = await this.findCoachByEmail(googleUser.email);

    if (existingCoach) {
      // Login existing coach
      return this.login({ email: googleUser.email, password: '' }, 'google');
    } else {
      // Register new coach
      return this.register({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        password: '', // Not used for Google auth
      }, 'google', googleUser);
    }
  }

  async updateProfile(coachID: string, updateProfileDto: UpdateProfileRequest) {
    const { firstName, lastName, email } = updateProfileDto;

    const existingCoach = await this.prisma.coach.findFirst({
      where: {
        email,
        id: { not: coachID },
        isActive: true,
      },
    });

    if (existingCoach) {
      throw new ConflictException('Email already exists');
    }

    const updatedCoach = await this.prisma.coach.update({
      where: { id: coachID },
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
        avatarUrl: true,
        websiteUrl: true,
        bio: true,
        timezone: true,
        phone: true,
      },
    });

    return {
      message: 'Profile updated successfully',
      user: updatedCoach,
    };
  }

  async updatePassword(passwordHash: string, coachID?: string, email?: string) {
    if (email || coachID) {
      await this.prisma.coach.update({
        where: { id: coachID, email },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });
      return { message: 'Password updated successfully' };
    }
    throw new BadRequestException('Could not identify user');
  }

  async uploadAvatar(coachID: string, avatarUrl: string) {
    await this.prisma.coach.update({
      where: { id: coachID },
      data: { avatarUrl, updatedAt: new Date() },
    });
  }

  async verifyEmail(coach: Coach) {
    await this.prisma.coach.update({
      where: { id: coach.id },
      data: {
        isVerified: true,
        lastLoginAt: new Date(),
      },
    });

    // Emit verification completed event
    await this.outbox.saveAndPublishEvent<AuthEvent>(
      {
        eventType: 'auth.coach.verified',
        schemaVersion: 1,
        payload: {
          coachID: coach.id,
          email: coach.email,
          verifiedAt: new Date().toISOString(),
        },
      },
      'auth.coach.verified'
    );

    return this.generateAuthResponse({
      ...coach,
      isVerified: true,
      lastLoginAt: new Date(),
    }, false);
  }

  async findByUserID(id: string) {
    const data = await this.prisma.coach.findUnique({
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
    return {
      ...data,
      type: UserType.coach,
    }
  }

  // HELPER METHODS
  private async findCoachByEmail(email: string) {
    return this.prisma.coach.findUnique({
      where: { email },
    });
  }

  private async generateAuthResponse(coach: any, isNewUser: boolean) {
    // Emit login event
    await this.outbox.saveAndPublishEvent<AuthEvent>(
      {
        eventType: 'auth.coach.login',
        schemaVersion: 1,
        payload: {
          coachID: coach.id,
          email: coach.email,
          loginAt: new Date().toISOString(),
        },
      },
      'auth.coach.login'
    );

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
      isNewUser,
    };
  }
}
