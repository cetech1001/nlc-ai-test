import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ValidationPipe, HttpExceptionFilter, AllExceptionsFilter } from '@nlc-ai/api-validation';
import {AuthLibModule, JwtAuthGuard} from '@nlc-ai/api-auth';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import {agentsConfig} from './config/agents.config';
import {CourseStructureModule} from "./course-structure/course-structure.module";
import {ReplicaModule} from "./replica/replica.module";
import {PublicChatModule} from "./public-chat/public-chat.module";
import {EventsModule} from "./events/events.module";
import {ClientEmailModule} from "./client-email/client-email.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [agentsConfig],
      cache: true,
      expandVariables: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule.forFeature(),
    MessagingModule.forRoot(),
    AuthLibModule,
    CourseStructureModule,
    ReplicaModule,
    PublicChatModule,
    EventsModule,
    ClientEmailModule,
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
