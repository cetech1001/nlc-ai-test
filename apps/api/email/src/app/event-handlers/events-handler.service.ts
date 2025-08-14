import {Injectable, Logger} from "@nestjs/common";
import {AuthEventsHandler, BillingEventsHandler, LeadClientEventsHandler} from "./handlers";

@Injectable()
export class EmailEventHandlersService {
  private readonly logger = new Logger(EmailEventHandlersService.name);

  constructor(
    private readonly authEventsHandler: AuthEventsHandler,
    private readonly leadClientEventsHandler: LeadClientEventsHandler,
    private readonly billingEventsHandler: BillingEventsHandler,
  ) {
    this.logger.log('Email event handlers initialized');
  }

  // Method to get handler status
  getHandlerStatus() {
    return {
      authHandler: 'active',
      leadClientHandler: 'active',
      billingHandler: 'active',
      timestamp: new Date(),
    };
  }

  // Method to manually trigger event processing (for testing)
  async processTestEvent(eventType: string, payload: any) {
    const testEvent = {
      eventType,
      eventID: `test-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      producer: 'email-service-test',
      source: 'email-service.test',
      schemaVersion: 1,
      payload,
    };

    try {
      if (eventType.startsWith('auth.')) {
        await this.authEventsHandler['handleVerificationRequested'](testEvent);
      } else if (eventType.startsWith('lead.') || eventType.startsWith('client.')) {
        await this.leadClientEventsHandler['handleLeadEvents'](testEvent);
      } else if (eventType.startsWith('billing.')) {
        await this.billingEventsHandler['handleBillingEvents'](testEvent);
      }

      return { success: true, message: 'Test event processed successfully' };
    } catch (error) {
      return {
        success: false,
        message: 'Test event processing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
