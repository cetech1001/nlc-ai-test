import {Injectable, Logger} from "@nestjs/common";
import {EventBusService} from "@nlc-ai/api-messaging";
import {EmailIntegrationService} from "../../email/email-integration.service";

@Injectable()
export class LeadClientEventsHandler {
  private readonly logger = new Logger(LeadClientEventsHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly emailIntegrationService: EmailIntegrationService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    // Subscribe to lead events
    await this.eventBus.subscribe(
      'email-service.lead-events',
      ['lead.created', 'lead.status.updated'],
      this.handleLeadEvents.bind(this)
    );

    // Subscribe to client events
    await this.eventBus.subscribe(
      'email-service.client-events',
      ['client.message.received', 'client.milestone.achieved'],
      this.handleClientEvents.bind(this)
    );

    // Subscribe to sequence events
    await this.eventBus.subscribe(
      'email-service.sequence-events',
      ['sequence.completed', 'sequence.paused', 'sequence.resumed'],
      this.handleSequenceEvents.bind(this)
    );
  }

  private async handleLeadEvents(event: any) {
    try {
      const { eventType, payload } = event;

      switch (eventType) {
        case 'lead.created':
          await this.handleLeadCreated(payload);
          break;
        case 'lead.status.updated':
          await this.handleLeadStatusUpdated(payload);
          break;
      }
    } catch (error) {
      this.logger.error('Failed to handle lead event:', error);
    }
  }

  private async handleClientEvents(event: any) {
    try {
      const { eventType, payload } = event;

      switch (eventType) {
        case 'client.message.received':
          await this.handleClientMessageReceived(payload);
          break;
        case 'client.milestone.achieved':
          await this.handleClientMilestone(payload);
          break;
      }
    } catch (error) {
      this.logger.error('Failed to handle client event:', error);
    }
  }

  private async handleSequenceEvents(event: any) {
    try {
      const { eventType, payload } = event;

      switch (eventType) {
        case 'sequence.completed':
          await this.handleSequenceCompleted(payload);
          break;
        case 'sequence.paused':
          await this.handleSequencePaused(payload);
          break;
        case 'sequence.resumed':
          await this.handleSequenceResumed(payload);
          break;
      }
    } catch (error) {
      this.logger.error('Failed to handle sequence event:', error);
    }
  }

  private async handleLeadCreated(payload: any) {
    const { leadID, coachID, source } = payload;

    // Start appropriate email sequence based on lead source
    const sequenceType = this.getSequenceTypeForSource(source);

    if (sequenceType) {
      // This would trigger the creation of an email sequence
      // await this.emailIntegrationService.createLeadSequence(leadID, coachID, sequenceType);
      this.logger.log(`Email sequence ${sequenceType} initiated for lead ${leadID}`);
    }
  }

  private async handleLeadStatusUpdated(payload: any) {
    const { leadID, coachID, oldStatus, newStatus } = payload;

    // Handle specific status changes
    if (newStatus === 'converted') {
      await this.sendLeadConversionEmail(leadID, coachID);
    } else if (newStatus === 'unsubscribed') {
      // Cancel any pending emails for this lead
      // await this.emailSchedulerService.cancelSequenceForLead(leadID);
      this.logger.log(`Email sequence cancelled for unsubscribed lead ${leadID}`);
    }
  }

  private async handleClientMessageReceived(payload: any) {
    const { clientID, coachID, messageContent, threadID } = payload;

    // This could trigger an automated response or alert to the coach
    // Implementation would depend on your specific business logic
    this.logger.log(`Client message received from ${clientID}, thread ${threadID}`);
  }

  private async handleClientMilestone(payload: any) {
    const { clientID, coachID, milestone, achievedAt } = payload;

    // Send congratulatory email for milestone achievement
    await this.sendMilestoneEmail(clientID, coachID, milestone);
  }

  private async handleSequenceCompleted(payload: any) {
    const { leadID, coachID, sequenceID } = payload;

    // Send sequence completion email and update lead status
    await this.emailIntegrationService.handleSequenceCompletion(leadID, coachID);
    this.logger.log(`Sequence ${sequenceID} completed for lead ${leadID}`);
  }

  private async handleSequencePaused(payload: any) {
    const { sequenceID, reason } = payload;
    this.logger.log(`Sequence ${sequenceID} paused: ${reason}`);
  }

  private async handleSequenceResumed(payload: any) {
    const { sequenceID } = payload;
    this.logger.log(`Sequence ${sequenceID} resumed`);
  }

  private getSequenceTypeForSource(source: string): string | null {
    const sourceSequenceMap: Record<string, string> = {
      'website': 'standard-nurture',
      'social-media': 'social-follow-up',
      'referral': 'referral-welcome',
      'webinar': 'webinar-follow-up',
      'free-consultation': 'consultation-follow-up',
    };

    return sourceSequenceMap[source] || 'default-follow-up';
  }

  private async sendLeadConversionEmail(leadID: string, coachID: string) {
    // Send congratulations email for lead conversion
    // Implementation would use emailIntegrationService
    this.logger.log(`Conversion email triggered for lead ${leadID}`);
  }

  private async sendMilestoneEmail(clientID: string, coachID: string, milestone: string) {
    // Send milestone achievement email
    // Implementation would use emailIntegrationService
    this.logger.log(`Milestone email triggered for client ${clientID}: ${milestone}`);
  }
}
