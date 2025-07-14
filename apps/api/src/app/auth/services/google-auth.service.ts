import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import {UserType} from "@nlc-ai/types";

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {
    this.client = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET')
    );
  }

  async validateGoogleToken(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      return {
        email: payload?.email,
        firstName: payload?.given_name,
        lastName: payload?.family_name,
        picture: payload?.picture,
        verified: payload?.email_verified,
      };
    } catch (error) {
      throw new BadRequestException('Invalid Google token');
    }
  }

  async googleAuth(user: any) {
    let existingUser = await this.prisma.coaches.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      existingUser = await this.prisma.coaches.create({
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: true,
          avatarUrl: user.picture,
        },
      });
    } else if (existingUser.isDeleted || !existingUser.isActive) {
      throw new BadRequestException('Account is deactivated');
    }

    await this.prisma.coaches.update({
      where: { id: existingUser.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: existingUser.id,
      email: existingUser.email,
      type: UserType.coach,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        businessName: existingUser.businessName,
        isVerified: existingUser.isVerified,
      },
    };
  }

  async loginWithGoogleToken(idToken: string) {
    const userData = await this.validateGoogleToken(idToken);
    return this.googleAuth(userData);
  }

  async registerWithGoogle(idToken: string) {
    const userData = await this.validateGoogleToken(idToken);

    const existingUser = await this.prisma.coaches.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    return this.googleAuth(userData);
  }
}
