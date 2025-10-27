import {Module} from "@nestjs/common";
import {AuthModule} from "../auth/auth.module";
import {LeadsHandler} from "./handlers/leads.handler";

@Module({
  imports: [AuthModule],
  providers: [LeadsHandler],
})
export class EventsModule {}
