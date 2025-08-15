import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LeadEventsHandler {
  private readonly logger = new Logger(LeadEventsHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Subscribe to relevant events from other services
    await this.subscribeToExternalEvents();
  }

  private async subscribeToExternalEvents() {
    const serviceName = this.configService.get<string>('leads.service.name', 'leads-service');

    try {
      // Subscribe to authentication events
      await this.eventBus.subscribe(
        `${serviceName}.auth.events`,
        ['auth.coach.registered', 'auth.client.registered'],
        this.handleAuthEvents.bind(this)
      );

      // Subscribe to email sequence events
      await this.eventBus.subscribe(
        `${serviceName}.email.events`,
        ['email.sequence.started', 'email.sequence.completed'],
        this.handleEmailEvents.bind(this)
      );

      this.logger.log('Successfully subscribed to external events');
    } catch (error) {
      this.logger.error('Failed to subscribe to external events', error);
    }
  }

  private async handleAuthEvents(event: any) {
    try {
      this.logger.log(`Received auth event: ${event.eventType}`, {
        eventID: event.eventID,
        eventType: event.eventType,
      });

      switch (event.eventType) {
        case 'auth.coach.registered':
          await this.handleCoachRegistered(event);
          break;

        case 'auth.client.registered':
          await this.handleClientRegistered(event);
          break;
      }
    } catch (error) {
      this.logger.error(`Error handling auth event: ${event.eventType}`, error);
    }
  }

  private async handleEmailEvents(event: any) {
    try {
      this.logger.log(`Received email event: ${event.eventType}`, {
        eventID: event.eventID,
        eventType: event.eventType,
      });

      switch (event.eventType) {
        case 'email.sequence.started':
          await this.handleEmailSequenceStarted(event);
          break;

        case 'email.sequence.completed':
          await this.handleEmailSequenceCompleted(event);
          break;
      }
    } catch (error) {
      this.logger.error(`Error handling email event: ${event.eventType}`, error);
    }
  }

  private async handleCoachRegistered(event: any) {
    // Handle coach registration - could update lead assignments, etc.
    this.logger.log(`Coach registered: ${event.payload.coachID} (${event.payload.email})`);

    // Example: Update unassigned leads that match coach criteria
    // Implementation would depend on business rules
  }

  private async handleClientRegistered(event: any) {
    // Handle client registration - might trigger lead conversion tracking
    this.logger.log(`Client registered: ${event.payload.clientID} from coach ${event.payload.coachID}`);

    // Example: Check if this was a lead conversion
    // Implementation would check for matching email addresses
  }

  private async handleEmailSequenceStarted(event: any) {
    // Handle email sequence start - could update lead nurture status
    this.logger.log(`Email sequence started for lead: ${event.payload.leadID}`);

    // Example: Update lead status or add tracking
  }

  private async handleEmailSequenceCompleted(event: any) {
    // Handle email sequence completion - could trigger follow-up actions
    this.logger.log(`Email sequence completed for lead: ${event.payload.leadID}`);

    // Example: Check conversion status, schedule follow-up, etc.
  }
}
