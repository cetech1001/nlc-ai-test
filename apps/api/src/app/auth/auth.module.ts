import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { CoachAuthController } from './controllers/coach-auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AdminLocalStrategy } from './strategies/admin-local.strategy';
import { EmailService } from '../email/email.service';
import { TokenService } from './services/token.service';

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
  controllers: [AuthController, AdminAuthController, CoachAuthController],
  providers: [
    AuthService,
    EmailService,
    TokenService,
    JwtStrategy,
    LocalStrategy,
    AdminLocalStrategy,
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
