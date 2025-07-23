import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LeadFollowupService } from './lead-followup/lead-followup.service';
import { AiAgentsController } from './ai-agents.controller';
import {EmailService} from "../email/email.service";
import {EmailSchedulerService} from "../email/email-scheduler.service";

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AiAgentsController],
  providers: [
    LeadFollowupService,
    EmailService,
    EmailSchedulerService,
  ],
  exports: [LeadFollowupService, EmailService, EmailSchedulerService],
})
export class AiAgentsModule {}
