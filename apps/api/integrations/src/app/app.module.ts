import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe, HttpExceptionFilter, AllExceptionsFilter } from '@nlc-ai/api-validation';
import {AuthLibModule, ServiceAuthGuard} from '@nlc-ai/api-auth';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import { IntegrationsModule } from './integrations/integrations.module';
import { EmailAccountsModule } from './email-accounts/email-accounts.module';
import { HealthModule } from './health/health.module';
import integrationsConfig from './config/integrations.config';
import {EmailSyncModule} from "./email-sync/email-sync.module";

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
    HealthModule,
    IntegrationsModule,
    EmailAccountsModule,
    EmailSyncModule,
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
