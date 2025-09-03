import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './health/health.module';
import coursesConfig from './config/courses.config';
import {DatabaseModule} from "@nlc-ai/api-database";
import {MessagingModule} from "@nlc-ai/api-messaging";
import {AuthLibModule, ServiceAuthGuard} from "@nlc-ai/api-auth";
import {AllExceptionsFilter, HttpExceptionFilter, ValidationPipe} from "@nlc-ai/api-validation";
import {CoursesModule} from "./courses/courses.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [coursesConfig],
      cache: true,
      expandVariables: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule.forFeature(),
    MessagingModule.forRoot(),
    AuthLibModule,
    HealthModule,
    CoursesModule,
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
