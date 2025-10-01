import { Module } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ValidationPipe, HttpExceptionFilter, AllExceptionsFilter } from '@nlc-ai/api-validation';
import {AuthLibModule, JwtAuthGuard} from '@nlc-ai/api-auth';
import { DatabaseModule } from '@nlc-ai/api-database';
import {MessagingModule} from "@nlc-ai/api-messaging";
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import {authConfig} from './config/auth.config';
import {ActivityModule} from "./activity/activity.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
      cache: true,
      expandVariables: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule.forFeature(),
    MessagingModule.forRoot(),
    AuthLibModule,
    AuthModule,
    ActivityModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
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
