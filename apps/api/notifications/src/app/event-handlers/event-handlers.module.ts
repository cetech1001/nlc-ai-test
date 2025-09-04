import { Module } from '@nestjs/common';
import { AuthEventsHandler } from './handlers/auth-events.handler';
import { BillingEventsHandler } from './handlers/billing-events.handler';
import { EmailEventsHandler } from './handlers/email-events.handler';
import {NotificationsModule} from "../notifications/notifications.module";
import {CommunityEventsHandler} from "./handlers/community-events.handler";
import {MessagingEventsHandler} from "./handlers/messaging-events.handler";

@Module({
  imports: [NotificationsModule],
  providers: [
    AuthEventsHandler,
    BillingEventsHandler,
    CommunityEventsHandler,
    EmailEventsHandler,
    MessagingEventsHandler
  ],
  exports: [
    AuthEventsHandler,
    BillingEventsHandler,
    CommunityEventsHandler,
    EmailEventsHandler,
    MessagingEventsHandler
  ],
})
export class EventHandlersModule {}
