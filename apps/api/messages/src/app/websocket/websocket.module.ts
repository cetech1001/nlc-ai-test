import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import {PresenceModule} from "../presence/presence.module";
import {ConversationHelperService} from "../messages/conversation-helper.service";

@Module({
  imports: [PresenceModule],
  providers: [MessagesGateway, ConversationHelperService],
  exports: [MessagesGateway],
})
export class WebSocketModule {}
