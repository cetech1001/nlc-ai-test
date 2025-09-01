import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ValidationPipe, HttpExceptionFilter, AllExceptionsFilter } from '@nlc-ai/api-validation';
import {AuthLibModule, ServiceAuthGuard} from '@nlc-ai/api-auth';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import { EmailModule } from './email/email.module';
import { TemplatesModule } from './templates/templates.module';
import { SequencesModule } from './sequences/sequences.module';
import { EventHandlersModule } from './event-handlers/event-handlers.module';
import { HealthModule } from './health/health.module';
import emailConfig from './config/email.config';
import {WebhooksModule} from "./webhooks/webhooks.module";
import {AnalyticsModule} from "./analytics/analytics.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [emailConfig],
      cache: true,
      expandVariables: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule.forFeature(),
    MessagingModule.forRoot(),
    AuthLibModule,
    HealthModule,
    EmailModule,
    TemplatesModule,
    SequencesModule,
    EventHandlersModule,
    WebhooksModule,
    AnalyticsModule
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
