import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailService } from '../email/email.service';
import { TokenService } from './services/token.service';
import {GoogleAuthService} from "./services/google-auth.service";
import {GoogleStrategy} from "./strategies/google.strategy";
import {CloudinaryService} from "./services/cloudinary.service";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleAuthService,
    EmailService,
    TokenService,
    CloudinaryService,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService, GoogleAuthService, TokenService, CloudinaryService],
})
export class AuthModule {}
