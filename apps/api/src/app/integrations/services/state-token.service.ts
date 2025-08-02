import {BadRequestException, Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StateTokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwt: JwtService) {}

  generateState(coachID: string, platform: string): string {
    const payload = {
      coachID,
      platform,
      exp: Date.now() + (10 * 60 * 1000),
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    const secret = this.configService.get('JWT_SECRET');
    return this.jwt.sign(payload, secret);
  }

  verifyState(state: string): { coachID: string; platform: string } {
    try {
      const secret = this.configService.get('JWT_SECRET');
      const payload = this.jwt.verify(state, secret) as any;

      if (payload.exp < Date.now()) {
        throw new Error('State token expired');
      }

      return {
        coachID: payload.coachID,
        platform: payload.platform,
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired state token');
    }
  }
}
