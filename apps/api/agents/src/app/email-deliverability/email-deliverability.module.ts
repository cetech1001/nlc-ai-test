import {Module} from "@nestjs/common";
import {EmailDeliverabilityController} from "./email-deliverability.controller";
import {EmailDeliverabilityService} from "./email-deliverability.service";

@Module({
  controllers: [EmailDeliverabilityController],
  providers: [EmailDeliverabilityService],
  exports: [EmailDeliverabilityService],
})
export class EmailDeliverabilityModule {}
