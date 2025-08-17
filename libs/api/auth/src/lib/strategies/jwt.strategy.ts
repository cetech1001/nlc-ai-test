import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import {PrismaService} from "@nlc-ai/api-database";
import {UserType} from "@nlc-ai/api-types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', ''),
      issuer: 'nlc-ai',
    });
  }

  async validate(payload: any) {
    const { sub: id, type } = payload;

    if (!id || !type) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.findUserByID(id, type);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      type,
    };
  }

  private findUserByID(id: string, type: UserType) {
    if (type === UserType.coach) {
      return this.findCoachByID(id);
    } else if (type === UserType.admin) {
      return this.findAdminByID(id);
    } else if (type === UserType.client) {
      return this.findClientByID(id);
    }

    return null;
  }

  private findCoachByID(id: string) {
    return this.prisma.coach.findUnique({
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
  }

  private findAdminByID(id: string) {
    return this.prisma.admin.findUnique({
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
  }

  private findClientByID(id: string) {
    return this.prisma.client.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        phone: true,
      },
    });
  }
}
