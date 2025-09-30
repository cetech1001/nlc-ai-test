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
  AuthResponse
} from '@nlc-ai/types';
import {Coach} from "@prisma/client";

@Injectable()
export class CoachAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly outbox: OutboxService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginRequest, provider?: 'google'): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const coach = await this.findCoachByEmail(email);

    if (!coach) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!coach.isActive || coach.isDeleted) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (provider === 'google') {
      if (coach.provider !== 'google') {
        throw new UnauthorizedException({
          code: 'ACCOUNT_CONFLICT',
          message: 'Account exists with different authentication method',
        });
      }
    } else {
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

    await this.prisma.coach.update({
      where: { id: coach.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateAuthResponse(coach, false);
  }

  async register(registerDto: RegistrationRequest, provider?: 'google', googleData?: ValidatedGoogleUser) {
    const { email, firstName, lastName } = registerDto;

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
      coachData = {
        ...coachData,
        avatarUrl: googleData.avatarUrl,
        isVerified: true,
        provider: 'google',
        providerID: googleData.providerID,
      };
    } else {
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

    if (provider !== 'google') {
      const code = this.tokenService.generateVerificationCode();
      await this.tokenService.storeVerificationToken(email, code, 'reset');

      await this.outbox.saveAndPublishEvent<AuthEvent>(
        {
          eventType: 'auth.verification.requested',
          schemaVersion: 1,
          payload: {
            email: coach.email,
            code: code,
            type: 'password_reset',
          },
        },
        'auth.verification.requested'
      );
    }

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
      return this.generateAuthResponse(coach, true);
    }

    return {
      message: 'Registration successful. Please check your email for verification code.',
      coachID: coach.id,
      requiresVerification: true,
      email: email,
    };
  }

  async googleAuth(googleUser: ValidatedGoogleUser) {
    const existingCoach = await this.findCoachByEmail(googleUser.email);

    if (existingCoach) {
      return this.login({ email: googleUser.email, password: '' }, 'google');
    } else {
      return this.register({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        password: '',
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

  private async findCoachByEmail(email: string) {
    return this.prisma.coach.findUnique({
      where: { email },
    });
  }

  private async generateAuthResponse(coach: any, isNewUser: boolean): Promise<AuthResponse> {
    const payload = {
      sub: coach.id,
      id: coach.id,
      name: coach.firstName + ' ' + coach.lastName,
      email: coach.email,
      type: UserType.COACH,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: coach.id,
        type: UserType.COACH,
        email: coach.email,
        firstName: coach.firstName,
        lastName: coach.lastName,
        businessName: coach.businessName,
        isVerified: coach.isVerified,
        avatarUrl: coach.avatarUrl,
        isActive: coach.isActive,
        createdAt: coach.createdAt,
      },
      isNewUser,
    };
  }
}
