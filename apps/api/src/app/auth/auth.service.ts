import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { TokenService } from './token.service';
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyCodeDto,
  AdminLoginDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}

  // Coach Authentication
  async registerCoach(registerDto: RegisterDto) {
    const { email, password, fullName } = registerDto;

    // Check if coach already exists
    const existingCoach = await this.prisma.coaches.findUnique({
      where: { email },
    });

    if (existingCoach) {
      throw new BadRequestException('Coach with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create coach
    const coach = await this.prisma.coaches.create({
      data: {
        email,
        passwordHash,
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        isVerified: false,
      },
    });

    // Send verification email
    await this.sendVerificationEmail(email);

    return {
      message: 'Registration successful. Please check your email for verification code.',
      coachId: coach.id,
    };
  }

  async loginCoach(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const coach = await this.validateCoach(email, password);

    // Update last login
    await this.prisma.coaches.update({
      where: { id: coach.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: coach.id,
      email: coach.email,
      type: 'coach',
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
      },
    };
  }

  async validateCoach(email: string, password: string) {
    const coach = await this.prisma.coaches.findUnique({
      where: { email },
    });

    if (!coach || !coach.isActive) {
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

  // Admin Authentication
  async loginAdmin(adminLoginDto: AdminLoginDto) {
    const { email, password } = adminLoginDto;

    const admin = await this.validateAdmin(email, password);

    // Update last login
    await this.prisma.admins.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: admin.id,
      email: admin.email,
      type: 'admin',
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
      },
    };
  }

  async validateAdmin(email: string, password: string) {
    const admin = await this.prisma.admins.findUnique({
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

  // Password Reset Flow
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto, userType: 'coach' | 'admin') {
    const { email } = forgotPasswordDto;

    let user;
    if (userType === 'coach') {
      user = await this.prisma.coaches.findUnique({ where: { email } });
    } else {
      user = await this.prisma.admins.findUnique({ where: { email } });
    }

    if (!user) {
      // Don't reveal if email exists or not
      return { message: 'If the email exists, a verification code has been sent.' };
    }

    await this.sendVerificationEmail(email, 'password-reset');

    return { message: 'Verification code sent to your email.' };
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto) {
    const { email, code } = verifyCodeDto;

    const isValid = await this.tokenService.verifyToken(email, code);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Generate reset token
    const resetToken = await this.tokenService.generateResetToken(email);

    return { resetToken };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, userType: 'coach' | 'admin') {
    const { token, password } = resetPasswordDto;

    const email = await this.tokenService.validateResetToken(token);
    if (!email) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (userType === 'coach') {
      await this.prisma.coaches.update({
        where: { email },
        data: { passwordHash },
      });
    } else {
      await this.prisma.admins.update({
        where: { email },
        data: { passwordHash },
      });
    }

    // Clean up tokens
    await this.tokenService.invalidateTokens(email);

    return { message: 'Password reset successfully' };
  }

  async resendCode(email: string) {
    await this.sendVerificationEmail(email);
    return { message: 'Verification code sent' };
  }

  private async sendVerificationEmail(email: string, type: 'verification' | 'password-reset' = 'verification') {
    const code = this.tokenService.generateVerificationCode();
    await this.tokenService.storeVerificationToken(email, code);

    if (type === 'verification') {
      await this.emailService.sendVerificationEmail(email, code);
    } else {
      await this.emailService.sendPasswordResetEmail(email, code);
    }
  }

  // Utility methods
  async findUserById(id: string, type: 'coach' | 'admin') {
    if (type === 'coach') {
      return this.prisma.coaches.findUnique({
        where: { id, isActive: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          businessName: true,
          isVerified: true,
        },
      });
    } else {
      return this.prisma.admins.findUnique({
        where: { id, isActive: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    }
  }
}
