import {Module} from "@nestjs/common";
import {CoachesModule} from "../coaches/coaches.module";
import {LeadsHandler} from "./handlers/leads.handler";

@Module({
  imports: [CoachesModule],
  providers: [LeadsHandler],
})
export class EventsModule {}
