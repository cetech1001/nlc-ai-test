import { Module } from '@nestjs/common';
import { MessagingModule } from '@nlc-ai/api-messaging';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import {WebSocketModule} from "../websocket/websocket.module";

@Module({
  imports: [
    MessagingModule.forRoot(),
    WebSocketModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
