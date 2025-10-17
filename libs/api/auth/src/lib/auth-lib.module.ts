import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import {AntiSpamGuard, JwtAuthGuard, UserTypesGuard} from "./guards";
import { ReplayCacheService } from "./services";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (config) => ({
        secret: config.get('JWT_SECRET') || 'fallback-secret',
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN') || '24h',
          issuer: 'nlc-ai',
        },
      }),
      inject: [ConfigService],
      global: true,
    }),
  ],
  providers: [
    AntiSpamGuard,
    JwtAuthGuard,
    UserTypesGuard,
    ReplayCacheService,
  ],
  exports: [
    JwtModule,
    AntiSpamGuard,
    JwtAuthGuard,
    UserTypesGuard,
    ReplayCacheService,
  ],
})
export class AuthLibModule {}
