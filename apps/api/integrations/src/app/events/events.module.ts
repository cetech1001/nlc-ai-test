import { Module } from '@nestjs/common';
import {ContentHandler} from "./handlers/content.handler";

@Module({
  providers: [ContentHandler],
  exports: [ContentHandler],
})
export class EventsModule {}
