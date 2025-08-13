import {Injectable, BadRequestException, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {OAuth2Client, TokenPayload} from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import {AuthenticatedUser, UserType, ValidatedGoogleUser} from "@nlc-ai/types";
import {PrismaService} from "@nlc-ai/api-database";

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


  async validateGoogleToken(idToken: string): Promise<ValidatedGoogleUser> {
    let payload: TokenPayload | undefined;

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      payload = ticket.getPayload();
    } catch (err) {
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!payload || !payload.sub || !payload.email) {
      throw new BadRequestException('Google token payload is missing required fields');
    }

    return {
      providerID: payload.sub,
      email: payload.email!,
      firstName: payload.given_name!,
      lastName: payload.family_name!,
      avatarUrl: payload.picture!,
    };
  }

  async googleAuth(user: ValidatedGoogleUser): Promise<AuthenticatedUser> {
    let existingUser = await this.prisma.coach.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      if (
        existingUser.provider !== 'google'
        || existingUser.providerID !== user.providerID
      ) {
        throw new UnauthorizedException({
          code: 'ACCOUNT_CONFLICT',
          message: 'An account with this email already exists.'
        });
      }
    }

    if (!existingUser) {
      existingUser = await this.prisma.coach.create({
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
          isVerified: true,
          provider: 'google',
          providerID: user.providerID,
        },
      });
    } else if (existingUser.isDeleted || !existingUser.isActive) {
      throw new BadRequestException('Account is deactivated');
    }

    await this.prisma.coach.update({
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
        avatarUrl: existingUser.avatarUrl,
      },
    };
  }

  async loginWithGoogleToken(idToken: string) {
    const userData = await this.validateGoogleToken(idToken);
    return this.googleAuth(userData);
  }

  async registerWithGoogle(idToken: string) {
    const userData = await this.validateGoogleToken(idToken);

    const existingUser = await this.prisma.coach.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    return this.googleAuth(userData);
  }
}
