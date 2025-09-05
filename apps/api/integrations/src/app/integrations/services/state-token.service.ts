import {BadRequestException, Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StateTokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwt: JwtService) {}

  generateState(userID: string, userType: string, platform: string): string {
    const payload = {
      userID,
      userType,
      platform,
      exp: Date.now() + (10 * 60 * 1000),
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    const secret = this.configService.get('integrations.auth.jwtSecret');
    return this.jwt.sign(payload, {
      secret,
    });
  }

  verifyState(state: string): { userID: string; userType: string; platform: string } {
    try {
      const secret = this.configService.get('integrations.auth.jwtSecret');
      const payload = this.jwt.verify(state, {
        secret,
      }) as any;

      if (payload.exp < Date.now()) {
        throw new Error('State token expired');
      }

      return {
        userID: payload.userID,
        userType: payload.userType,
        platform: payload.platform,
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired state token');
    }
  }
}
