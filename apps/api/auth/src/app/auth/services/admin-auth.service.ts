import {BadRequestException, ConflictException, Injectable, UnauthorizedException} from "@nestjs/common";
import {LoginRequest, UserType} from "@nlc-ai/api-types";
import * as bcrypt from "bcryptjs";
import {PrismaService} from "@nlc-ai/api-database";
import {OutboxService} from "@nlc-ai/api-messaging";
import {JwtService} from "@nestjs/jwt";
import {AuthEvent, UpdateProfileRequest} from "@nlc-ai/api-types";

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly jwtService: JwtService) {
  }

  async login(adminLoginDto: LoginRequest) {
    const { email, password } = adminLoginDto;

    const admin = await this.validateAdmin(email, password);

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    await this.outbox.saveAndPublishEvent<AuthEvent>(
      {
        eventType: 'auth.admin.login',
        schemaVersion: 1,
        payload: {
          adminID: admin.id,
          email: admin.email,
          role: admin.role,
          loginAt: new Date().toISOString(),
        },
      },
      'auth.admin.login'
    );

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

  async updateProfile(adminID: string, updateProfileDto: UpdateProfileRequest) {
    const { firstName, lastName, email } = updateProfileDto;

    const existingAdmin = await this.prisma.admin.findFirst({
      where: {
        email,
        id: { not: adminID },
        isActive: true,
      },
    });

    if (existingAdmin) {
      throw new ConflictException('Email already exists');
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { id: adminID },
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
        avatarUrl: true,
      },
    });

    return {
      message: 'Profile updated successfully',
      user: updatedAdmin,
    };
  }

  async updatePassword(passwordHash: string, adminID?: string, email?: string) {
    if (adminID || email) {
      await this.prisma.admin.update({
        where: { id: adminID, email },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });

      return { message: 'Password updated successfully' };
    }
    throw new BadRequestException('Could not identify user');
  }

  async uploadAvatar(adminID: string, avatarUrl: string) {
    await this.prisma.admin.update({
      where: { id: adminID },
      data: { avatarUrl, updatedAt: new Date() },
    });
  }

  async findByUserID(id: string) {
    const data = await this.prisma.admin.findUnique({
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

    return {
      ...data,
      type: UserType.admin,
    }
  }
}
