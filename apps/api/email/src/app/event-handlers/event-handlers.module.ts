import {Module} from "@nestjs/common";
import {AuthEventsHandler, LeadClientEventsHandler, BillingEventsHandler} from "./handlers";
import {EmailModule} from "../email/email.module";

@Module({
  imports: [EmailModule],
  providers: [
    AuthEventsHandler,
    LeadClientEventsHandler,
    BillingEventsHandler
  ],
  exports: [
    AuthEventsHandler,
    LeadClientEventsHandler,
    BillingEventsHandler
  ],
})
export class EventHandlersModule {}
