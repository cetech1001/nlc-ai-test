import {Injectable, ConflictException, UnauthorizedException, BadRequestException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@nlc-ai/api-database';
import { TokenService } from './token.service';
import { OutboxService } from '@nlc-ai/api-messaging';
import {AuthEvent, LoginRequest, RegistrationRequest, UserType, ValidatedGoogleUser} from "@nlc-ai/api-types";

@Injectable()
export class CoachAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly outbox: OutboxService,
    private readonly jwtService: JwtService,
  ) {}

  async registerCoach(registerDto: RegistrationRequest) {
    const { email, password, firstName, lastName } = registerDto;

    const existingCoach = await this.prisma.coach.findUnique({
      where: { email },
    });

    if (existingCoach) {
      throw new ConflictException('Coach with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const coach = await this.prisma.coach.create({
      data: {
        email,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        isVerified: false,
        isActive: true,
        subscriptionStatus: 'trial',
      },
    });

    // Generate verification code
    const code = this.tokenService.generateVerificationCode();
    await this.tokenService.storeVerificationToken(email, code, 'verification');

    // Emit events
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
    };
  }

  async googleCoachAuth(googleUser: ValidatedGoogleUser) {
    let existingCoach = await this.prisma.coach.findUnique({
      where: { email: googleUser.email },
    });

    if (existingCoach) {
      // Existing coach - verify provider match
      if (existingCoach.provider !== 'google' || existingCoach.providerID !== googleUser.providerID) {
        throw new UnauthorizedException({
          code: 'ACCOUNT_CONFLICT',
          message: 'An account with this email already exists with different authentication method.',
        });
      }

      // Check if account is active
      if (existingCoach.isDeleted || !existingCoach.isActive) {
        throw new BadRequestException('Account is deactivated');
      }

      // Login existing coach
      return this.loginExistingGoogleCoach(existingCoach);
    }

    // Register new coach
    return this.registerNewGoogleCoach(googleUser);
  }

  private async loginExistingGoogleCoach(coach: any) {
    await this.prisma.coach.update({
      where: { id: coach.id },
      data: { lastLoginAt: new Date() },
    });

    // Emit login event
    await this.outbox.saveAndPublishEvent(
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
      isNewUser: false,
    };
  }

  private async registerNewGoogleCoach(googleUser: ValidatedGoogleUser) {
    const newCoach = await this.prisma.coach.create({
      data: {
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        avatarUrl: googleUser.avatarUrl,
        isVerified: true, // Google accounts are pre-verified
        provider: 'google',
        providerID: googleUser.providerID,
        subscriptionStatus: 'trial',
        isActive: true,
      },
    });

    // Emit registration event
    await this.outbox.saveAndPublishEvent(
      {
        eventType: 'auth.coach.registered',
        schemaVersion: 1,
        payload: {
          coachID: newCoach.id,
          email: newCoach.email,
          firstName: newCoach.firstName,
          lastName: newCoach.lastName,
        },
      },
      'auth.coach.registered'
    );

    // Emit login event (since they're automatically logged in)
    await this.outbox.saveAndPublishEvent(
      {
        eventType: 'auth.coach.login',
        schemaVersion: 1,
        payload: {
          coachID: newCoach.id,
          email: newCoach.email,
          loginAt: new Date().toISOString(),
        },
      },
      'auth.coach.login'
    );

    const payload = {
      sub: newCoach.id,
      email: newCoach.email,
      type: UserType.coach,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: newCoach.id,
        email: newCoach.email,
        firstName: newCoach.firstName,
        lastName: newCoach.lastName,
        businessName: newCoach.businessName,
        isVerified: newCoach.isVerified,
        avatarUrl: newCoach.avatarUrl,
      },
      isNewUser: true,
    };
  }

  private async validateCoach(email: string, password: string) {
    const coach = await this.prisma.coach.findUnique({
      where: { email },
    });

    if (!coach || !coach.isActive || coach.isDeleted) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!coach.passwordHash && coach.provider === null) {
      throw new UnauthorizedException('Please complete your registration');
    }

    if (coach.passwordHash && password) {
      const isPasswordValid = await bcrypt.compare(password, coach.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    return coach;
  }
}
