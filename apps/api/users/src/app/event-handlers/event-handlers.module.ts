import { Module } from '@nestjs/common';
import { AuthEventsHandler } from './auth-events.handler';

@Module({
  providers: [AuthEventsHandler],
  exports: [AuthEventsHandler],
})
export class EventHandlersModule {}
