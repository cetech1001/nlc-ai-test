import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ValidationPipe, HttpExceptionFilter, AllExceptionsFilter } from '@nlc-ai/api-validation';
import { ServiceAuthGuard } from '@nlc-ai/api-auth';
import { DatabaseModule } from '@nlc-ai/api-database';
import {MessagingModule} from "@nlc-ai/api-messaging";
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import authConfig from './config/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
      cache: true,
      expandVariables: true,
    }),
    JwtModule.registerAsync({
      useFactory: (config) => ({
        secret: config.get('JWT_SECRET') || 'fallback-secret',
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN') || '24h',
          audience: 'auth-service',
          issuer: 'nlc-ai',
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule.forRoot({ schema: 'auth' }),
    MessagingModule.forRoot(),
    HealthModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: ServiceAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
