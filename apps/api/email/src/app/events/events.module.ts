import {Module} from "@nestjs/common";
import {AuthHandler, UsersHandler, BillingHandler, LeadsHandler} from "./handlers";
import {SendModule} from "../send/send.module";

@Module({
  imports: [SendModule],
  providers: [
    AuthHandler,
    BillingHandler,
    LeadsHandler,
    UsersHandler,
  ],
})
export class EventsModule {}
