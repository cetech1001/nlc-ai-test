import { Module } from '@nestjs/common';
import { LeadsHandler } from './handlers/leads.handler';

@Module({
  providers: [LeadsHandler],
  exports: [LeadsHandler],
})
export class EventsModule {}
