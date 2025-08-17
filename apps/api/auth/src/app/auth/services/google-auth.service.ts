import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { ValidatedGoogleUser } from '@nlc-ai/api-types';
import { ClientAuthService } from './client-auth.service';
import { CoachAuthService } from './coach-auth.service';

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly clientAuthService: ClientAuthService,
    private readonly coachAuthService: CoachAuthService
  ) {
    this.client = new OAuth2Client(
      this.configService.get<string>('auth.google.clientID'),
      this.configService.get<string>('auth.google.clientSecret')
    );
  }

  async validateGoogleToken(idToken: string): Promise<ValidatedGoogleUser> {
    let payload: TokenPayload | undefined;

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('auth.google.clientID'),
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
      firstName: payload.given_name || '',
      lastName: payload.family_name || '',
      avatarUrl: payload.picture || '',
    };
  }

  // Coach Google auth - unified login/register
  async coachGoogleAuth(idToken: string) {
    const userData = await this.validateGoogleToken(idToken);
    return this.coachAuthService.googleAuth(userData);
  }

  // Client Google auth - with invite token
  async clientGoogleAuth(idToken: string, inviteToken: string) {
    const userData = await this.validateGoogleToken(idToken);
    return this.clientAuthService.googleAuth(userData, inviteToken);
  }
}
