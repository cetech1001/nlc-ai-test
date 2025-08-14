import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailService } from './services/email.service';
import { EmailSchedulerService } from './services/email-scheduler.service';
import { EmailTemplatesService } from './services/email-templates.service';
import { EmailTemplatesController } from './controllers/email-templates.controller';
import { EmailWebhookController } from './controllers/email-webhook.controller';
import {EmailEventController} from "./controllers/email-event.controller";
import { EmailStatsController } from './email-stats.controller';
import { DatabaseModule } from '@nlc-ai/api-database';
import { MessagingModule } from '@nlc-ai/api-messaging';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule,
    DatabaseModule,
    MessagingModule,
  ],
  controllers: [
    EmailTemplatesController,
    EmailWebhookController,
    EmailEventController,
    EmailStatsController,
  ],
  providers: [
    EmailService,
    EmailSchedulerService,
    EmailTemplatesService,
  ],
  exports: [
    EmailService,
    EmailSchedulerService,
    EmailTemplatesService,
  ],
})
export class EmailModule {}
