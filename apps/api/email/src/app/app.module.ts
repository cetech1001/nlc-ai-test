import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ValidationPipe, HttpExceptionFilter, AllExceptionsFilter } from '@nlc-ai/api-validation';
import {AuthLibModule, JwtAuthGuard} from '@nlc-ai/api-auth';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import { SequencesModule } from './sequences/sequences.module';
import { EventsModule } from './events/events.module';
import {emailConfig} from './config/email.config';
import {WebhooksModule} from "./webhooks/webhooks.module";
import {AccountsModule} from "./accounts/accounts.module";
import {SendModule} from "./send/send.module";
import {ThreadsModule} from "./threads/threads.module";
import {BullModule} from "@nestjs/bull";
import {EmailInternalController} from "./internal/email-internal.controller";
import {SyncModule} from "./sync/sync.module";
import {CachingModule} from "@nlc-ai/api-caching";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [emailConfig],
      cache: true,
      expandVariables: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('email.redis.host', 'redis'),
          port: configService.get<number>('email.redis.port', 6379),
          password: configService.get<string>('email.redis.password'),
          db: configService.get<number>('email.redis.db', 0),
          maxRetriesPerRequest: 3,
          retryDelayOnFailure: 100,
          enableReadyCheck: false,
        },
      }),
      inject: [ConfigService],
    }),
    CachingModule.forRoot({
      isGlobal: false,
      config: {
        keyPrefix: 'nlc:email:',
        defaultTTL: 300,
      }
    }),
    ScheduleModule.forRoot(),
    DatabaseModule.forFeature(),
    MessagingModule.forRoot(),
    AuthLibModule,
    AccountsModule,
    SendModule,
    EventsModule,
    SequencesModule,
    ThreadsModule,
    WebhooksModule,
    SyncModule,
  ],
  controllers: [EmailInternalController],
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
