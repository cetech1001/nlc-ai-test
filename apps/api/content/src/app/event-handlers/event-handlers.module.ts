import {Module} from "@nestjs/common";
import {IntegrationEventsHandler} from "./handlers/integration-events.handler";
import {ContentSyncModule} from "../content-sync/content-sync.module";

@Module({
  imports: [ContentSyncModule],
  providers: [IntegrationEventsHandler],
  exports: [IntegrationEventsHandler],
})
export class EventHandlersModule {}
