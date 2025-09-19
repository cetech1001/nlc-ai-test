import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import {DatabaseModule} from "@nlc-ai/api-database";
import {MessagingModule} from "@nlc-ai/api-messaging";
import {AuthLibModule, ServiceAuthGuard} from "@nlc-ai/api-auth";
import {AllExceptionsFilter, HttpExceptionFilter, ValidationPipe} from "@nlc-ai/api-validation";
import {AppService} from "./app.service";
import {AppController} from "./app.controller";
import coursesConfig from './config/courses.config';
import { HealthModule } from './health/health.module';
import {ChaptersModule} from "./chapters/chapters.module";
import {DripScheduleModule} from "./drip-schedule/drip-schedule.module";

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
    ChaptersModule,
    DripScheduleModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
