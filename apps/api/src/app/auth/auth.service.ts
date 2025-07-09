import {Injectable, UnauthorizedException, BadRequestException, ConflictException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { TokenService } from './services/token.service';
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyCodeDto,
  AdminLoginDto,
} from './dto';
import {UpdateProfileDto, UpdatePasswordDto} from "./dto";
import {AUTH_USER_TYPE, USER_TYPE} from "@nlc-ai/types";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}

  async registerCoach(registerDto: RegisterDto) {
    const { email, password, fullName } = registerDto;

    const existingCoach = await this.prisma.coaches.findUnique({
      where: { email },
    });

    if (existingCoach) {
      throw new BadRequestException('Coach with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const coach = await this.prisma.coaches.create({
      data: {
        email,
        passwordHash,
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        isVerified: false,
      },
    });

    await this.sendVerificationEmail(email);

    return {
      message: 'Registration successful. Please check your email for verification code.',
      coachId: coach.id,
    };
  }

  async loginCoach(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const coach = await this.validateCoach(email, password);

    await this.prisma.coaches.update({
      where: { id: coach.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: coach.id,
      email: coach.email,
      type: USER_TYPE.coach,
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

  async loginAdmin(adminLoginDto: AdminLoginDto) {
    const { email, password } = adminLoginDto;

    const admin = await this.validateAdmin(email, password);

    await this.prisma.admins.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: admin.id,
      email: admin.email,
      type: USER_TYPE.admin,
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

  async updateProfile(userId: string, userType: AUTH_USER_TYPE, updateProfileDto: UpdateProfileDto) {
    const { firstName, lastName, email } = updateProfileDto;

    if (userType === USER_TYPE.coach) {
      const existingCoach = await this.prisma.coaches.findFirst({
        where: {
          email,
          id: { not: userId },
          isActive: true,
        },
      });

      if (existingCoach) {
        throw new ConflictException('Email already exists');
      }

      const updatedCoach = await this.prisma.coaches.update({
        where: { id: userId },
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
      const existingAdmin = await this.prisma.admins.findFirst({
        where: {
          email,
          id: { not: userId },
          isActive: true,
        },
      });

      if (existingAdmin) {
        throw new ConflictException('Email already exists');
      }

      const updatedAdmin = await this.prisma.admins.update({
        where: { id: userId },
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

  async updatePassword(userId: string, userType: AUTH_USER_TYPE, updatePasswordDto: UpdatePasswordDto) {
    const { newPassword } = updatePasswordDto;

    const passwordHash = await bcrypt.hash(newPassword, 12);

    if (userType === USER_TYPE.coach) {
      await this.prisma.coaches.update({
        where: { id: userId },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });
    } else {
      await this.prisma.admins.update({
        where: { id: userId },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });
    }

    return { message: 'Password updated successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto, userType: AUTH_USER_TYPE) {
    const { email } = forgotPasswordDto;

    let user;
    if (userType === USER_TYPE.coach) {
      user = await this.prisma.coaches.findUnique({ where: { email } });
    } else {
      user = await this.prisma.admins.findUnique({ where: { email } });
    }

    if (!user) {
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

    const resetToken = await this.tokenService.generateResetToken(email);

    return { resetToken };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, userType: AUTH_USER_TYPE) {
    const { token, password } = resetPasswordDto;

    const email = await this.tokenService.validateResetToken(token);
    if (!email) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (userType === USER_TYPE.coach) {
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
  async findUserById(id: string, type: AUTH_USER_TYPE) {
    if (type === USER_TYPE.coach) {
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
