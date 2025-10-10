import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe, HttpExceptionFilter, AllExceptionsFilter } from '@nlc-ai/api-validation';
import {AuthLibModule, JwtAuthGuard} from '@nlc-ai/api-auth';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';

import { LeadsModule } from './leads/leads.module';
import { EventHandlersModule } from './event-handlers/event-handlers.module';
import leadsConfig from './config/leads.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [leadsConfig],
      cache: true,
      expandVariables: true,
    }),
    AuthLibModule,
    DatabaseModule.forFeature(),
    MessagingModule.forRoot(),
    LeadsModule,
    EventHandlersModule,
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
