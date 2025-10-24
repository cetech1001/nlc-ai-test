import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe, HttpExceptionFilter, AllExceptionsFilter } from '@nlc-ai/api-validation';
import {AuthLibModule, JwtAuthGuard} from '@nlc-ai/api-auth';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';
import {integrationsConfig} from './config/integrations.config';
import {EventsModule} from "./events/events.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [integrationsConfig],
      cache: true,
      expandVariables: true,
    }),
    DatabaseModule.forFeature(),
    MessagingModule.forRoot(),
    AuthLibModule,
    IntegrationsModule,
    EventsModule,
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
