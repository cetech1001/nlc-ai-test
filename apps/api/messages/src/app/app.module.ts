import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import { HealthModule } from './health/health.module';
import messagingConfig from './config/messages.config';
import {AllExceptionsFilter, HttpExceptionFilter, ValidationPipe} from "@nlc-ai/api-validation";
import {AuthLibModule, JwtAuthGuard} from "@nlc-ai/api-auth";
import {MessagesModule} from "./messages/messages.module";
import {WebSocketModule} from "./websocket/websocket.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [messagingConfig],
      cache: true,
      expandVariables: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule.forFeature(),
    MessagingModule.forRoot(),
    AuthLibModule,
    HealthModule,
    MessagesModule,
    WebSocketModule,
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
