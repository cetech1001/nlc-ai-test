import {Module} from "@nestjs/common";
import {AuthEventsHandler, LeadClientEventsHandler, BillingEventsHandler} from "./handlers";
import {TransactionalModule} from "../transactional/transactional.module";

@Module({
  imports: [TransactionalModule],
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
