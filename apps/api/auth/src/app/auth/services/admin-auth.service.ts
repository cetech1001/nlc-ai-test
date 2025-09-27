import {BadRequestException, Injectable, UnauthorizedException} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import {PrismaService} from "@nlc-ai/api-database";
import {JwtService} from "@nestjs/jwt";
import {
  AuthResponse,
  LoginRequest,
  UserType
} from "@nlc-ai/types";

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService) {
  }

  async login(adminLoginDto: LoginRequest): Promise<AuthResponse> {
    const { email, password } = adminLoginDto;

    const admin = await this.validateAdmin(email, password);

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: admin.id,
      email: admin.email,
      type: UserType.ADMIN,
      role: admin.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: admin.id,
        type: UserType.ADMIN,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role || undefined,
        avatarUrl: admin.avatarUrl || undefined,
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
}
