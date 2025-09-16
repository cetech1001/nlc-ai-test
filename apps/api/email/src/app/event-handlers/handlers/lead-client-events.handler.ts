import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { AppService } from '../../app.service';
import {ConfigService} from "@nestjs/config";
import {Coach} from "@prisma/client";

@Injectable()
export class LeadClientEventsHandler {
  private readonly logger = new Logger(LeadClientEventsHandler.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly eventBus: EventBusService,
    private readonly emailService: AppService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'email-service.lead-events',
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
      'email-service.client-events',
      ['client.message.received', 'client.milestone.achieved'],
      this.handleClientEvents.bind(this)
    );

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

  private async handleLandingLeadSubmitted(payload: any) {
    const { leadID, name, email, qualified, answers } = payload;

    this.logger.log(`Landing lead submitted: ${leadID} (qualified: ${qualified})`);

    if (qualified) {
      await this.createCoachAccountForLead(leadID, name, email, answers);
    } else {
      await this.sendUnqualifiedLeadEmail(email, name);
    }
  }

  private async createCoachAccountForLead(leadID: string, name: string, email: string, answers: any) {
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

        throw new Error(`Failed to create coach account: ${errorData.message}`);
      }

      const coachData: Coach = await response.json() as Coach;
      this.logger.log(`Coach account created successfully: ${coachData.id}`);
    } catch (error) {
      this.logger.error(`Failed to create coach account for lead ${leadID}:`, error);
      await this.sendWelcomeEmailFallback(email, name);
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

  // NEW: Send email to unqualified leads
  private async sendUnqualifiedLeadEmail(email: string, name: string) {
    try {
      const firstName = name.split(' ')[0];

      await this.emailService.sendEmail({
        to: email,
        subject: 'Thank you for your interest in Next Level Coach AI',
        html: this.getUnqualifiedLeadEmailTemplate(firstName),
        text: `Hi ${firstName},\n\nThank you for taking the time to complete our assessment. While you may not meet all the current criteria for our exclusive program, we appreciate your interest.\n\nWe'll keep you updated as we expand our offerings.\n\nBest regards,\nThe Next Level Coach AI Team`,
        templateID: 'unqualified-lead'
      });

      this.logger.log(`Unqualified lead email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send unqualified lead email to ${email}:`, error);
    }
  }

  // NEW: Welcome email fallback if account creation fails
  private async sendWelcomeEmailFallback(email: string, name: string) {
    try {
      const firstName = name.split(' ')[0];

      await this.emailService.sendEmail({
        to: email,
        subject: 'Welcome to Next Level Coach AI - We\'ll be in touch soon!',
        html: this.getWelcomeFallbackEmailTemplate(firstName),
        text: `Hi ${firstName},\n\nThank you for qualifying for Next Level Coach AI! We're excited to have you join our exclusive program.\n\nOur team will be reaching out to you shortly to help you get started.\n\nBest regards,\nThe Next Level Coach AI Team`,
        templateID: 'welcome-fallback'
      });

      this.logger.log(`Welcome fallback email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome fallback email to ${email}:`, error);
    }
  }

  // Helper method to generate temporary password
  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-12) + 'A1!';
  }

  // Email templates
  private getUnqualifiedLeadEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank you for your interest</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 50%, #FEBEFA 100%); padding: 40px 20px; text-align: center; }
          .logo { color: white; font-size: 24px; font-weight: bold; margin: 0; }
          .content { padding: 40px 20px; color: #f5f5f4; }
          .footer { padding: 20px; text-align: center; color: #a0a0a0; font-size: 14px; border-top: 1px solid #2a2a2a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Next Level Coach AI</h1>
          </div>
          <div class="content">
            <h2 style="color: #f5f5f4; margin-top: 0;">Thank you for your interest, ${firstName}!</h2>
            <p>Thank you for taking the time to complete our assessment and showing interest in Next Level Coach AI.</p>

            <p>While you may not meet all the current criteria for our exclusive program at this time, we truly appreciate your interest in transforming your coaching business with AI.</p>

            <p>We're continuously expanding our offerings and would love to keep you updated on future opportunities that might be a perfect fit for your coaching journey.</p>

            <p>Keep building amazing things!</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Next Level Coach AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeFallbackEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Next Level Coach AI</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 50%, #FEBEFA 100%); padding: 40px 20px; text-align: center; }
          .logo { color: white; font-size: 24px; font-weight: bold; margin: 0; }
          .content { padding: 40px 20px; color: #f5f5f4; }
          .footer { padding: 20px; text-align: center; color: #a0a0a0; font-size: 14px; border-top: 1px solid #2a2a2a; }
          .highlight { background-color: #2a2a2a; border-left: 4px solid #7B21BA; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Next Level Coach AI</h1>
          </div>
          <div class="content">
            <h2 style="color: #f5f5f4; margin-top: 0;">Congratulations, ${firstName}! 🎉</h2>
            <p>You've qualified for Next Level Coach AI - our exclusive program for transforming coaching businesses with AI!</p>

            <div class="highlight">
              <p style="margin: 0; color: #FEBEFA;"><strong>What happens next:</strong></p>
              <p style="margin: 10px 0 0 0;">Our team will be reaching out to you within the next 24-48 hours to help you get started with your AI-powered coaching transformation.</p>
            </div>

            <p>We're excited to help you revolutionize how you connect with and serve your clients using the power of artificial intelligence.</p>

            <p>Keep an eye on your inbox - amazing things are coming your way!</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Next Level Coach AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
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

  private async handleClientMessageReceived(payload: any) {
    const { clientID, threadID } = payload;
    this.logger.log(`Client message received from ${clientID}, thread ${threadID}`);
  }

  private async handleClientMilestone(payload: any) {
    const { clientID, coachID, milestone } = payload;
    await this.sendMilestoneEmail(clientID, coachID, milestone);
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

  private async sendMilestoneEmail(clientID: string, coachID: string, milestone: string) {
    this.logger.log(`Milestone email triggered for client ${clientID}: ${milestone}`);
  }
}
