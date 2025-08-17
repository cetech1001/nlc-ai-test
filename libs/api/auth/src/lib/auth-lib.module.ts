import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {DatabaseModule} from "@nlc-ai/api-database";
import {JwtStrategy} from "./strategies";
import {JwtModule} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {ServiceAuthGuard} from "./guards";

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
    }),
    DatabaseModule.forFeature(),
  ],
  providers: [
    JwtStrategy,
    ServiceAuthGuard,
  ],
  exports: [JwtStrategy, JwtModule],
})
export class AuthLibModule {}
