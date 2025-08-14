import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailService } from './email.service';
import { EmailSchedulerService } from './email-scheduler.service';
import {EmailEventController} from "./email-event.controller";
import { EmailStatsController } from './email-stats.controller';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';
import {EmailIntegrationService} from "./email-integration.service";

@Module({
  imports: [
    ConfigModule,
    ScheduleModule,
    DatabaseModule,
    MessagingModule,
  ],
  controllers: [
    EmailEventController,
    EmailStatsController,
  ],
  providers: [
    EmailService,
    EmailSchedulerService,
    EmailIntegrationService,
  ],
  exports: [
    EmailService,
    EmailSchedulerService,
  ],
})
export class EmailModule {}
