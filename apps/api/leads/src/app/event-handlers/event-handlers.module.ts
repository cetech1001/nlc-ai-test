import { Module } from '@nestjs/common';
import { LeadEventsHandler } from './lead-events.handler';

@Module({
  providers: [LeadEventsHandler],
  exports: [LeadEventsHandler],
})
export class EventHandlersModule {}
