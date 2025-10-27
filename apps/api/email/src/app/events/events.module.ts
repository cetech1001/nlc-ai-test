import {Module} from "@nestjs/common";
import {AuthHandler, UsersHandler, BillingHandler, LeadsHandler} from "./handlers";
import {SendModule} from "../send/send.module";
import {MessagesHandler} from "./handlers/messages.handler";

@Module({
  imports: [SendModule],
  providers: [
    AuthHandler,
    BillingHandler,
    LeadsHandler,
    UsersHandler,
    MessagesHandler,
  ],
})
export class EventsModule {}
