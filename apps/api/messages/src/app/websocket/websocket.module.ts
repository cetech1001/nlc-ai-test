import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import {PresenceModule} from "../presence/presence.module";

@Module({
  imports: [PresenceModule],
  providers: [MessagesGateway],
  exports: [MessagesGateway],
})
export class WebSocketModule {}
