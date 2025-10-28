import {Module} from "@nestjs/common";
import {AuthModule} from "../auth/auth.module";
import {LeadsHandler} from "./handlers/leads.handler";
import {AuthHandler} from "./handlers/auth.handler";

@Module({
  imports: [AuthModule],
  providers: [
    AuthHandler,
    LeadsHandler
  ],
})
export class EventsModule {}
