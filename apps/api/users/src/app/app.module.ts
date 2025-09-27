import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ValidationPipe, HttpExceptionFilter, AllExceptionsFilter } from '@nlc-ai/api-validation';
import {AuthLibModule, JwtAuthGuard} from '@nlc-ai/api-auth';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import { ClientsModule } from './clients/clients.module';
import { CoachesModule } from './coaches/coaches.module';
import { AdminModule } from './admin/admin.module';
import { RelationshipsModule } from './relationships/relationships.module';
import { ProfilesModule } from './profiles/profiles.module';
import { HealthModule } from './health/health.module';
import {usersConfig} from './config/users.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [usersConfig],
      cache: true,
      expandVariables: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule.forFeature(),
    MessagingModule.forRoot(),
    AuthLibModule,
    HealthModule,
    ClientsModule,
    CoachesModule,
    AdminModule,
    RelationshipsModule,
    ProfilesModule,
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
