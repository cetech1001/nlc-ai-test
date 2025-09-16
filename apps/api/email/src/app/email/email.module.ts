import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from '../app.service';
import { EmailSchedulerService } from './email-scheduler.service';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import {EmailIntegrationService} from "./email-integration.service";
import {TemplatesModule} from "../templates/templates.module";

@Module({
  imports: [
    ConfigModule,
    ScheduleModule,
    DatabaseModule,
    MessagingModule,
    TemplatesModule,
  ],
  controllers: [
  ],
  providers: [
    AppService,
    EmailSchedulerService,
    EmailIntegrationService,
  ],
  exports: [
    AppService,
    EmailSchedulerService,
    EmailIntegrationService,
  ],
})
export class EmailModule {}
