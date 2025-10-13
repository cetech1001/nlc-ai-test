import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SendService } from './send.service';
import { SendProcessor } from './processors/send.processor';
import { SmtpService } from './services/smtp.service';
import { SendController } from './send.controller';
import {ProvidersService} from "./services/providers.service";
import {MailgunService} from "./services/mailgun.service";
import {ScheduleModule} from "@nestjs/schedule";
import {ScheduledProcessor} from "./processors/scheduled.processor";
import {SchedulerService} from "./services/scheduler.service";

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'email-delivery',
      },
      {
        name: 'scheduled-emails',
      }
    ),
    ScheduleModule.forRoot(),
  ],
  controllers: [SendController],
  providers: [
    MailgunService,
    {
      provide: 'EMAIL_PROVIDER',
      useClass: MailgunService,
    },
    ProvidersService,
    SendService,
    SendProcessor,
    SmtpService,
    ScheduledProcessor,
    SchedulerService,
  ],
  exports: [SendService],
})
export class SendModule {}
