import {Module} from "@nestjs/common";
import {IntegrationHandler} from "./handlers/integration.handler";
import {ContentSyncModule} from "../content-sync/content-sync.module";

@Module({
  imports: [ContentSyncModule],
  providers: [IntegrationHandler],
  exports: [IntegrationHandler],
})
export class EventsModule {}
