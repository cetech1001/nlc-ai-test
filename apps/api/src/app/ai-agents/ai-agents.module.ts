import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LeadFollowupService } from './lead-followup/lead-followup.service';
import {EmailService} from "../email/email.service";
import {EmailSchedulerService} from "../email/email-scheduler.service";
import {CoachReplicaController} from "./coach-replica/coach-replica.controller";
import {CoachReplicaService} from "./coach-replica/coach-replica.service";
import {EmailDeliverabilityController} from "./email-deliverability/email-deliverability.controller";
import {EmailDeliverabilityService} from "./email-deliverability/email-deliverability.service";
import {LeadFollowupController} from "./lead-followup/lead-followup.controller";

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [
    LeadFollowupController,
    CoachReplicaController,
    EmailDeliverabilityController,
  ],
  providers: [
    EmailService,
    EmailSchedulerService,
    CoachReplicaService,
    LeadFollowupService,
    EmailDeliverabilityService,
  ],
  exports: [
    CoachReplicaService,
    LeadFollowupService,
    EmailDeliverabilityService,
  ],
})
export class AiAgentsModule {}
