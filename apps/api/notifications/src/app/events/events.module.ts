import { Module } from '@nestjs/common';
import { AuthHandler } from './handlers/auth.handler';
import { BillingHandler } from './handlers/billing.handler';
import { EmailHandler } from './handlers/email.handler';
import {NotificationsModule} from "../notifications/notifications.module";
import {CommunityHandler} from "./handlers/community.handler";
import {MessagesHandler} from "./handlers/messages.handler";

@Module({
  imports: [NotificationsModule],
  providers: [
    AuthHandler,
    BillingHandler,
    CommunityHandler,
    EmailHandler,
    MessagesHandler
  ],
  exports: [
    AuthHandler,
    BillingHandler,
    CommunityHandler,
    EmailHandler,
    MessagesHandler
  ],
})
export class EventsModule {}
