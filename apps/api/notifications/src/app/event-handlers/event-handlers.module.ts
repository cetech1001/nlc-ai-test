import { Module } from '@nestjs/common';
import { AuthEventsHandler } from './handlers/auth-events.handler';
import { BillingEventsHandler } from './handlers/billing-events.handler';
import { EmailEventsHandler } from './handlers/email-events.handler';
import { OrchestratorModule } from '../orchestrator/orchestrator.module';

@Module({
  imports: [OrchestratorModule],
  providers: [
    AuthEventsHandler,
    BillingEventsHandler,
    EmailEventsHandler,
  ],
  exports: [
    AuthEventsHandler,
    BillingEventsHandler,
    EmailEventsHandler,
  ],
})
export class EventHandlersModule {}
