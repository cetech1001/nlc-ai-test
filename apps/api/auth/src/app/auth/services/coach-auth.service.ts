import {LoginRequest, RegistrationRequest, UserType} from "@nlc-ai/types";
import {ConflictException, UnauthorizedException} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import {PrismaService} from "@nlc-ai/api-database";
import {TokenService} from "./token.service";
import {OutboxService} from "@nlc-ai/api-messaging";
import {JwtService} from "@nestjs/jwt";

export class CoachAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly outbox: OutboxService,
    private readonly jwtService: JwtService) {
  }

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

    // Generate verification code
    const code = this.tokenService.generateVerificationCode();
    await this.tokenService.storeVerificationToken(email, code, 'verification');

    // Emit events
    await this.outbox.saveAndPublishEvent(
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

    await this.outbox.saveAndPublishEvent(
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

      await this.outbox.saveAndPublishEvent(
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
}
