import {Injectable, UnauthorizedException} from "@nestjs/common";
import {LoginRequest, UserType} from "@nlc-ai/types";
import * as bcrypt from "bcryptjs";
import {PrismaService} from "@nlc-ai/api-database";
import {OutboxService} from "@nlc-ai/api-messaging";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly jwtService: JwtService) {
  }

  async loginAdmin(adminLoginDto: LoginRequest) {
    const { email, password } = adminLoginDto;

    const admin = await this.validateAdmin(email, password);

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Emit login event
    await this.outbox.saveAndPublishEvent(
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
}
