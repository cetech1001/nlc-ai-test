import { Module } from '@nestjs/common';
import { MessagingModule } from '@nlc-ai/api-messaging';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import {WebSocketModule} from "../websocket/websocket.module";
import {ConversationHelperService} from "./conversation-helper.service";

@Module({
  imports: [
    MessagingModule.forRoot(),
    WebSocketModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, ConversationHelperService],
  exports: [MessagesService],
})
export class MessagesModule {}
