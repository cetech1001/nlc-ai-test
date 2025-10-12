import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import {ConfigService} from "@nestjs/config";
import {Coach} from "@prisma/client";

@Injectable()
export class LeadsHandler {
  private readonly logger = new Logger(LeadsHandler.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly eventBus: EventBusService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'email.leads',
      [
        'lead.created',
        'lead.status.updated',
        'lead.landing.submitted',
        'lead.qualified',
        'auth.coach.registered'
      ],
      this.handleLeadEvents.bind(this)
    );

    await this.eventBus.subscribe(
      'email.sequence-events',
      [
        'sequence.completed',
        'sequence.paused',
        'sequence.resumed'
      ],
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
        case 'lead.landing.submitted':
          await this.handleLandingLeadSubmitted(payload);
          break;
        case 'lead.qualified':
          await this.handleLeadQualified(payload);
          break;
        case 'auth.coach.registered':
          await this.handleCoachRegistered(payload);
          break;
      }
    } catch (error) {
      this.logger.error('Failed to handle lead event:', error);
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

  private async handleLandingLeadSubmitted(payload: any) {
    const { leadID, name, email, qualified, marketingOptIn } = payload;

    this.logger.log(`Landing lead submitted: ${leadID} (qualified: ${qualified})`);

    if (qualified) {
      await this.createCoachAccountForLead(leadID, name, email, marketingOptIn);
    }
  }

  private async createCoachAccountForLead(leadID: string, name: string, email: string, marketingOptIn: boolean) {
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(' ') || '';

      this.logger.log(`Creating coach account for qualified lead: ${email}`);

      const response = await fetch(`${this.configService.get('email.services.auth')}/coach/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          marketingOptIn,
          password: this.generateTemporaryPassword(),
        }),
      });

      if (!response.ok) {
        const errorData: any = await response.json();

        if (response.status === 409) {
          this.logger.warn(`Coach account already exists for email: ${email}`);
          await this.sendPasswordResetForExistingCoach(email, firstName);
          return;
        }

        console.log("Error: ", errorData);

        throw new Error(`Failed to create coach account: ${errorData.message}`);
      }

      const coachData: Coach = await response.json() as Coach;
      this.logger.log(`Coach account created successfully: ${coachData.id}`);
    } catch (error) {
      console.error("Error thrown: ", error);
      this.logger.error(`Failed to create coach account for lead ${leadID}:`, error);
    }
  }

  private async handleCoachRegistered(payload: any) {
    const { email } = payload;

    this.logger.log(`Sending password reset email to new coach: ${email}`);

    try {
      const response = await fetch(`${this.configService.get('email.services.auth')}/auth/forgot-password?type=coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate password reset');
      }

      this.logger.log(`Password reset initiated for new coach: ${email}`);

    } catch (error) {
      this.logger.error(`Failed to send password reset to new coach ${email}:`, error);
    }
  }

  // NEW: Send password reset for existing coach
  private async sendPasswordResetForExistingCoach(email: string, firstName: string) {
    try {
      const response = await fetch(`${this.configService.get('email.services.auth')}/auth/forgot-password?type=coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      if (response.ok) {
        this.logger.log(`Password reset sent to existing coach: ${email}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send password reset to existing coach ${email}:`, error);
    }
  }

  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-12) + 'A1!';
  }


  // Existing methods (kept the same)
  private async handleLeadCreated(payload: any) {
    const { leadID, source } = payload;

    // Start appropriate email sequence based on lead source
    const sequenceType = this.getSequenceTypeForSource(source);

    if (sequenceType) {
      this.logger.log(`Email sequence ${sequenceType} initiated for lead ${leadID}`);
    }
  }

  private async handleLeadStatusUpdated(payload: any) {
    const { leadID, coachID, newStatus } = payload;

    if (newStatus === 'converted') {
      await this.sendLeadConversionEmail(leadID, coachID);
    } else if (newStatus === 'unsubscribed') {
      this.logger.log(`Email sequence cancelled for unsubscribed lead ${leadID}`);
    }
  }

  private async handleLeadQualified(payload: any) {
    const { leadID, email } = payload;
    this.logger.log(`Lead qualified: ${leadID} (${email})`);
  }

  private async handleSequenceCompleted(payload: any) {
    const { leadID, sequenceID } = payload;
    // await this.emailIntegrationService.handleSequenceCompletion(leadID, coachID);
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
      'Website': 'standard-nurture',
      'social-media': 'social-follow-up',
      'referral': 'referral-welcome',
      'webinar': 'webinar-follow-up',
      'free-consultation': 'consultation-follow-up',
    };

    return sourceSequenceMap[source] || 'default-follow-up';
  }

  private async sendLeadConversionEmail(leadID: string, coachID: string) {
    this.logger.log(`Conversion email triggered for lead ${leadID}`);
  }
}
