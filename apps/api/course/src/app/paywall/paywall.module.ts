import {Module} from "@nestjs/common";
import {PaywallController} from "./paywall.controller";
import {PaywallService} from "./paywall.service";

@Module({
  controllers: [PaywallController],
  providers: [PaywallService],
  exports: [PaywallService],
})
export class PaywallModule {}
