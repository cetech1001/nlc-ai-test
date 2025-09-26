import { Module } from '@nestjs/common';
import {ContentEventsHandler} from "./handlers/content-events.handler";

@Module({
  providers: [ContentEventsHandler],
  exports: [ContentEventsHandler],
})
export class EventHandlersModule {}
