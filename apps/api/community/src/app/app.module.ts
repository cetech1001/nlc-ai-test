import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe, HttpExceptionFilter, AllExceptionsFilter } from '@nlc-ai/api-validation';
import {AuthLibModule, ServiceAuthGuard} from '@nlc-ai/api-auth';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import { CommunityModule } from './community/community.module';
import { PostsModule } from './posts/posts.module';
import { EventHandlersModule } from './event-handlers/event-handlers.module';
import { HealthModule } from './health/health.module';
import communityConfig from './config/community.config';
import {ModerationModule} from "./moderation/moderation.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [communityConfig],
      cache: true,
      expandVariables: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule.forFeature(),
    MessagingModule.forRoot(),
    AuthLibModule,
    HealthModule,
    CommunityModule,
    PostsModule,
    ModerationModule,
    EventHandlersModule,
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
