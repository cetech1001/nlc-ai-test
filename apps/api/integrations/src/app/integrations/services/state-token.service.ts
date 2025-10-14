import {BadRequestException, Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import crypto from 'crypto';
import {JwtService} from '@nestjs/jwt';

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
      nonce: crypto.randomBytes(16).toString('hex'),
    };


    const secret = this.configService.get('integrations.auth.jwtSecret');
    return this.jwt.sign(payload, {
      secret,
      expiresIn: '10m',
    });
  }

  verifyState(state: string): { userID: string; userType: string; platform: string } {
    try {
      const secret = this.configService.get('integrations.auth.jwtSecret');
      const payload = this.jwt.verify(state, {
        secret,
      }) as any;


      return {
        userID: payload.userID,
        userType: payload.userType,
        platform: payload.platform,
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired state token.');
    }
  }
}
