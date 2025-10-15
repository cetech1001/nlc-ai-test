import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe, HttpExceptionFilter, AllExceptionsFilter } from '@nlc-ai/api-validation';
import {AuthLibModule, JwtAuthGuard} from '@nlc-ai/api-auth';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import {contentConfig} from './config/content.config';
import {CategoriesModule} from "./categories/categories.module";
import {ContentPiecesModule} from "./content-pieces/content-pieces.module";
import {ContentSyncModule} from "./content-sync/content-sync.module";
import {EventsModule} from "./events/events.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [contentConfig],
      cache: true,
      expandVariables: true,
    }),
    DatabaseModule.forFeature(),
    MessagingModule.forRoot(),
    AuthLibModule,
    CategoriesModule,
    ContentPiecesModule,
    ContentSyncModule,
    EventsModule,
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
