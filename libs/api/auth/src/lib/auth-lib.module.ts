import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { DatabaseModule } from "@nlc-ai/api-database";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { JwtAuthGuard } from "./guards";
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
    DatabaseModule.forFeature(),
  ],
  providers: [
    JwtAuthGuard,
    ReplayCacheService,
  ],
  exports: [
    JwtModule,
    JwtAuthGuard,
    ReplayCacheService,
  ],
})
export class AuthLibModule {}
