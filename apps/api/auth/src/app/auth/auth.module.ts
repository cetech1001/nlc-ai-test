import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleAuthService } from './services/google-auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { TokenService } from './services/token.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.jwt.expiresIn', '7d'),
          audience: 'auth-service',
          issuer: 'nlc-ai',
        },
      }),
      inject: [ConfigService],
    }),
    CloudinaryModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleAuthService,
    TokenService,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService, GoogleAuthService, TokenService, JwtModule],
})
export class AuthModule {}
