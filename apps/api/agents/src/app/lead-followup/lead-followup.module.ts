import {Module} from "@nestjs/common";
import {LeadFollowupController} from "./lead-followup.controller";
import {LeadFollowupService} from "./lead-followup.service";
import {CoachReplicaModule} from "../coach-replica/coach-replica.module";
import {EmailDeliverabilityModule} from "../email-deliverability/email-deliverability.module";

@Module({
  imports: [CoachReplicaModule, EmailDeliverabilityModule],
  controllers: [LeadFollowupController],
  providers: [LeadFollowupService],
  exports: [LeadFollowupService],
})
export class LeadFollowupModule {}
