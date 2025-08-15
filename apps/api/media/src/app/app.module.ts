import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ValidationPipe, HttpExceptionFilter, AllExceptionsFilter } from '@nlc-ai/api-validation';
import { ServiceAuthGuard } from '@nlc-ai/api-auth';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import { MediaModule } from './media/media.module';
import { HealthModule } from './health/health.module';
import mediaConfig from './config/media.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mediaConfig],
      cache: true,
      expandVariables: true,
    }),
    JwtModule.registerAsync({
      useFactory: (config) => ({
        secret: config.get('media.jwt.secret') || 'fallback-secret',
        signOptions: {
          expiresIn: config.get('media.jwt.expiresIn') || '24h',
          audience: 'media-service',
          issuer: 'nlc-ai',
        },
      }),
      inject: [ConfigModule],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule.forFeature(),
    MessagingModule.forRoot(),
    HealthModule,
    MediaModule,
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
