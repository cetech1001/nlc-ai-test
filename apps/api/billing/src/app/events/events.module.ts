import {Module} from "@nestjs/common";
import {OutboxService} from "./outbox.service";
import {MessagingModule} from "@nlc-ai/api-messaging";

@Module({
  imports: [MessagingModule],
  providers: [OutboxService],
  exports: [OutboxService],
})
export class EventsModule {}
