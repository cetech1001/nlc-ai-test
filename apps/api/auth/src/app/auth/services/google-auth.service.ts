import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { ClientAuthService } from './client-auth.service';
import { CoachAuthService } from './coach-auth.service';
import {AuthResponse, ValidatedGoogleUser} from "@nlc-ai/types";

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor(
    private readonly config: ConfigService,
    private readonly clientAuthService: ClientAuthService,
    private readonly coachAuthService: CoachAuthService
  ) {
    this.client = new OAuth2Client(
      this.config.get<string>('auth.google.clientID'),
      this.config.get<string>('auth.google.clientSecret')
    );
  }

  async validateGoogleToken(idToken: string): Promise<ValidatedGoogleUser> {
    let payload: TokenPayload | undefined;

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.config.get<string>('auth.google.clientID'),
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

  async coachGoogleAuth(idToken: string): Promise<AuthResponse> {
    const userData = await this.validateGoogleToken(idToken);
    return await this.coachAuthService.googleAuth(userData) as unknown as AuthResponse;
  }

  async clientGoogleAuth(idToken: string, inviteToken: string): Promise<AuthResponse> {
    const userData = await this.validateGoogleToken(idToken);
    return await this.clientAuthService.googleAuth(userData, inviteToken) as unknown as AuthResponse;
  }
}
