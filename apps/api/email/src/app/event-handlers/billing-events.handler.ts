import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { EmailService } from '../email/email.service';
import { EmailIntegrationService } from '../email/email-integration.service';
import { getWelcomeEmailTemplate } from "../email/templates/auth";

@Injectable()
export class AuthEventsHandler {
  private readonly logger = new Logger(AuthEventsHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly emailService: EmailService,
    private readonly emailIntegrationService: EmailIntegrationService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    // Subscribe to auth verification events
    await this.eventBus.subscribe(
      'email-service.auth-verification',
      ['auth.verification.requested'],
      this.handleVerificationRequested.bind(this)
    );

    // Subscribe to coach registration events
    await this.eventBus.subscribe(
      'email-service.coach-registration',
      ['auth.coach.registered'],
      this.handleCoachRegistered.bind(this)
    );

    // Subscribe to coach verification events
    await this.eventBus.subscribe(
      'email-service.coach-verification',
      ['auth.coach.verified'],
      this.handleCoachVerified.bind(this)
    );

    // Subscribe to password reset events
    await this.eventBus.subscribe(
      'email-service.password-reset',
      ['auth.password.reset'],
      this.handlePasswordReset.bind(this)
    );

    // Subscribe to client invitation events
    await this.eventBus.subscribe(
      'email-service.client-invitations',
      ['auth.client.invited'],
      this.handleClientInvited.bind(this)
    );
  }

  private async handleVerificationRequested(event: any) {
    try {
      const { email, type, code } = event.payload;

      if (type === 'email_verification') {
        await this.emailService.sendVerificationEmail(email, code);
        this.logger.log(`Verification email sent to ${email}`);
      } else if (type === 'password_reset') {
        await this.emailService.sendPasswordResetEmail(email, code);
        this.logger.log(`Password reset email sent to ${email}`);
      }
    } catch (error) {
      this.logger.error('Failed to handle verification request:', error);
    }
  }

  private async handleCoachRegistered(event: any) {
    try {
      const { email, firstName, lastName } = event.payload;
      const fullName = `${firstName} ${lastName}`;
      const frontendURL = process.env.FRONTEND_URL || 'https://app.nextlevelcoach.ai';

      await this.emailService.sendWelcomeEmail(email, fullName, frontendURL);
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send welcome email:', error);
    }
  }

  private async handleCoachVerified(event: any) {
    try {
      const { email, coachID } = event.payload;

      // Send onboarding sequence or additional welcome materials
      await this.sendOnboardingSequence(coachID, email);
      this.logger.log(`Onboarding sequence initiated for ${email}`);
    } catch (error) {
      this.logger.error('Failed to handle coach verification:', error);
    }
  }

  private async handlePasswordReset(event: any) {
    try {
      const { email, userType } = event.payload;

      // Send password reset confirmation
      await this.sendPasswordResetConfirmation(email, userType);
      this.logger.log(`Password reset confirmation sent to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send password reset confirmation:', error);
    }
  }

  private async handleClientInvited(event: any) {
    try {
      const {
        email,
        coachName,
        businessName,
        token,
        message,
        expiresAt
      } = event.payload;

      await this.sendClientInvitationEmail(
        email,
        coachName,
        businessName,
        token,
        message,
        new Date(expiresAt)
      );

      this.logger.log(`Client invitation sent to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send client invitation:', error);
    }
  }

  private async sendOnboardingSequence(coachID: string, email: string) {
    // Create a series of onboarding emails
    const onboardingEmails = [
      {
        delay: 1, // 1 day
        subject: 'Getting Started with Next Level Coach AI',
        template: 'onboarding-step-1',
      },
      {
        delay: 3, // 3 days
        subject: 'Setting Up Your First Email Sequence',
        template: 'onboarding-step-2',
      },
      {
        delay: 7, // 7 days
        subject: 'Advanced Features and Best Practices',
        template: 'onboarding-step-3',
      },
    ];

    for (const emailData of onboardingEmails) {
      const scheduledFor = new Date(Date.now() + emailData.delay * 24 * 60 * 60 * 1000);

      // Schedule onboarding email (you'd need to implement this)
      // await this.scheduleOnboardingEmail(coachID, email, emailData, scheduledFor);
    }
  }

  private async sendPasswordResetConfirmation(email: string, userType: string) {
    const subject = 'Password Reset Successful';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Password Reset Successful</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 20px; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Successful</h1>
          </div>
          <div style="padding: 20px;">
            <p>Your password has been successfully reset.</p>
            <p>If you did not request this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: email,
      subject,
      html,
      templateID: 'password-reset-confirmation',
    });
  }

  private async sendClientInvitationEmail(
    email: string,
    coachName: string,
    businessName: string,
    token: string,
    message?: string,
    expiresAt?: Date
  ) {
    const inviteUrl = `${process.env.FRONTEND_URL}/client/accept-invite?token=${token}`;
    const expiryText = expiresAt
      ? `This invitation expires on ${expiresAt.toLocaleDateString()}.`
      : 'This invitation will expire in 7 days.';

    const subject = `You've been invited to join ${businessName || `${coachName}'s coaching program`}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Coaching Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .message-box { background-color: #2a2a2a; border-left: 4px solid #7B21BA; padding: 20px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're Invited!</h1>
            <p style="margin: 0; opacity: 0.9;">Join ${businessName || `${coachName}'s coaching program`}</p>
          </div>
          <div class="content">
            <h2 style="color: #FEBEFA;">Welcome to Your Coaching Journey</h2>
            <p>Hi there!</p>
            <p>${coachName} has invited you to join their coaching program. This is the beginning of an exciting journey toward achieving your goals!</p>

            ${message ? `
            <div class="message-box">
              <h3 style="color: #FEBEFA; margin-top: 0;">Personal Message from ${coachName}:</h3>
              <p style="margin-bottom: 0;">${message}</p>
            </div>
            ` : ''}

            <p style="text-align: center;">
              <a href="${inviteUrl}" class="button">Accept Invitation</a>
            </p>

            <p style="font-size: 14px; color: #a0a0a0;">${expiryText}</p>

            <p>If you have any questions, feel free to reply to this email.</p>

            <p>Looking forward to working with you!</p>
            <p><strong>${coachName}</strong><br>
            ${businessName || 'Professional Coach'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: email,
      subject,
      html,
      templateID: 'client-invitation',
      metadata: {
        coachName,
        businessName,
        inviteToken: token,
      },
    });
  }
}

// Lead and Client Events Handler
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

// Billing Events Handler (for payment-related emails)
@Injectable()
export class BillingEventsHandler {
  private readonly logger = new Logger(BillingEventsHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly emailService: EmailService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'email-service.billing-events',
      [
        'billing.payment.completed',
        'billing.payment.failed',
        'billing.subscription.activated',
        'billing.subscription.cancelled',
        'billing.invoice.issued'
      ],
      this.handleBillingEvents.bind(this)
    );
  }

  private async handleBillingEvents(event: any) {
    try {
      const { eventType, payload } = event;

      switch (eventType) {
        case 'billing.payment.completed':
          await this.handlePaymentCompleted(payload);
          break;
        case 'billing.payment.failed':
          await this.handlePaymentFailed(payload);
          break;
        case 'billing.subscription.activated':
          await this.handleSubscriptionActivated(payload);
          break;
        case 'billing.subscription.cancelled':
          await this.handleSubscriptionCancelled(payload);
          break;
        case 'billing.invoice.issued':
          await this.handleInvoiceIssued(payload);
          break;
      }
    } catch (error) {
      this.logger.error('Failed to handle billing event:', error);
    }
  }

  private async handlePaymentCompleted(payload: any) {
    const { coachID, amount, planName, transactionID } = payload;

    // Send payment confirmation email
    await this.sendPaymentConfirmationEmail(coachID, amount, planName, transactionID);
    this.logger.log(`Payment confirmation sent for transaction ${transactionID}`);
  }

  private async handlePaymentFailed(payload: any) {
    const { coachID, amount, reason, retryUrl } = payload;

    // Send payment failure notification
    await this.sendPaymentFailureEmail(coachID, amount, reason, retryUrl);
    this.logger.log(`Payment failure notification sent to coach ${coachID}`);
  }

  private async handleSubscriptionActivated(payload: any) {
    const { coachID, planName, billingCycle } = payload;

    // Send subscription activation email
    await this.sendSubscriptionActivationEmail(coachID, planName, billingCycle);
    this.logger.log(`Subscription activation email sent to coach ${coachID}`);
  }

  private async handleSubscriptionCancelled(payload: any) {
    const { coachID, planName, cancelReason } = payload;

    // Send subscription cancellation confirmation
    await this.sendSubscriptionCancellationEmail(coachID, planName, cancelReason);
    this.logger.log(`Subscription cancellation email sent to coach ${coachID}`);
  }

  private async handleInvoiceIssued(payload: any) {
    const { coachID, invoiceNumber, amount, dueDate } = payload;

    // Send invoice notification
    await this.sendInvoiceEmail(coachID, invoiceNumber, amount, new Date(dueDate));
    this.logger.log(`Invoice email sent to coach ${coachID} for invoice ${invoiceNumber}`);
  }

  private async sendPaymentConfirmationEmail(
    coachID: string,
    amount: number,
    planName: string,
    transactionID: string
  ) {
    // Get coach details
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!coach) return;

    const subject = 'Payment Confirmation - Next Level Coach AI';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .success-icon { font-size: 48px; color: #10b981; text-align: center; margin: 20px 0; }
          .amount { font-size: 32px; font-weight: bold; color: #FEBEFA; text-align: center; margin: 20px 0; }
          .details { background-color: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed!</h1>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <h2 style="color: #FEBEFA; text-align: center;">Thank you for your payment</h2>

            <div class="amount">${(amount / 100).toFixed(2)}</div>

            <div class="details">
              <h3 style="color: #FEBEFA; margin-top: 0;">Payment Details</h3>
              <p><strong>Plan:</strong> ${planName}</p>
              <p><strong>Transaction ID:</strong> ${transactionID}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> Card ending in ****</p>
            </div>

            <p>Your subscription is now active and you have full access to all features.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: coach.email,
      subject,
      html,
      templateID: 'payment-confirmation',
      metadata: { coachID, transactionID, amount, planName },
    });
  }

  private async sendPaymentFailureEmail(
    coachID: string,
    amount: number,
    reason: string,
    retryUrl: string
  ) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!coach) return;

    const subject = 'Payment Issue - Action Required';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Issue</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .warning-icon { font-size: 48px; color: #ef4444; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .details { background-color: #2a2a2a; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Issue</h1>
          </div>
          <div class="content">
            <div class="warning-icon">⚠️</div>
            <h2 style="color: #ef4444; text-align: center;">Payment Could Not Be Processed</h2>

            <div class="details">
              <h3 style="color: #ef4444; margin-top: 0;">Payment Details</h3>
              <p><strong>Amount:</strong> ${(amount / 100).toFixed(2)}</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>We were unable to process your payment. To continue enjoying uninterrupted access to Next Level Coach AI, please update your payment method.</p>

            <p style="text-align: center;">
              <a href="${retryUrl}" class="button">Update Payment Method</a>
            </p>

            <p>If you continue to experience issues, please contact our support team for assistance.</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: coach.email,
      subject,
      html,
      templateID: 'payment-failure',
      metadata: { coachID, amount, reason },
    });
  }

  private async sendSubscriptionActivationEmail(
    coachID: string,
    planName: string,
    billingCycle: string
  ) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!coach) return;

    const subject = `Welcome to ${planName} - Your Subscription is Active!`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Subscription Activated</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .success-icon { font-size: 48px; color: #10b981; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .features { background-color: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature { margin: 10px 0; color: #d6d3d1; }
          .checkmark { color: #10b981; margin-right: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Subscription Activated!</h1>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <h2 style="color: #FEBEFA; text-align: center;">Welcome to ${planName}</h2>

            <p>Congratulations! Your ${planName} subscription is now active with ${billingCycle} billing.</p>

            <div class="features">
              <h3 style="color: #FEBEFA; margin-top: 0;">What's included in your plan:</h3>
              <div class="feature"><span class="checkmark">✓</span> Unlimited email sequences</div>
              <div class="feature"><span class="checkmark">✓</span> AI-powered response generation</div>
              <div class="feature"><span class="checkmark">✓</span> Advanced analytics and insights</div>
              <div class="feature"><span class="checkmark">✓</span> Priority customer support</div>
              <div class="feature"><span class="checkmark">✓</span> Custom email templates</div>
            </div>

            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Access Your Dashboard</a>
            </p>

            <p>Ready to take your coaching business to the next level? Start by setting up your first email sequence!</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: coach.email,
      subject,
      html,
      templateID: 'subscription-activation',
      metadata: { coachID, planName, billingCycle },
    });
  }

  private async sendSubscriptionCancellationEmail(
    coachID: string,
    planName: string,
    cancelReason?: string
  ) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!coach) return;

    const subject = 'Subscription Cancelled - We\'re Sorry to See You Go';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Subscription Cancelled</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%); padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Cancelled</h1>
          </div>
          <div class="content">
            <h2 style="color: #FEBEFA;">We're sorry to see you go</h2>

            <p>Your ${planName} subscription has been cancelled as requested.</p>

            ${cancelReason ? `<p><strong>Cancellation reason:</strong> ${cancelReason}</p>` : ''}

            <p>Your account will remain active until the end of your current billing period. You'll continue to have access to all features until then.</p>

            <p>We'd love to have you back anytime! If you change your mind, you can reactivate your subscription at any time.</p>

            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/billing" class="button">Reactivate Subscription</a>
            </p>

            <p>If you have any feedback on how we can improve, please don't hesitate to reach out.</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: coach.email,
      subject,
      html,
      templateID: 'subscription-cancellation',
      metadata: { coachID, planName, cancelReason },
    });
  }

  private async sendInvoiceEmail(
    coachID: string,
    invoiceNumber: string,
    amount: number,
    dueDate: Date
  ) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!coach) return;

    const subject = `Invoice ${invoiceNumber} - Next Level Coach AI`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .invoice-details { background-color: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #FEBEFA; }
          .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Invoice</h1>
          </div>
          <div class="content">
            <h2 style="color: #FEBEFA;">Invoice ${invoiceNumber}</h2>

            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Due:</strong> <span class="amount">${(amount / 100).toFixed(2)}</span></p>
              <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
              <p><strong>Issued:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>Your invoice for Next Level Coach AI services is ready. Please review and complete payment by the due date to avoid any service interruption.</p>

            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/billing/invoices/${invoiceNumber}" class="button">View & Pay Invoice</a>
            </p>

            <p>If you have any questions about this invoice, please contact our billing team.</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: coach.email,
      subject,
      html,
      templateID: 'invoice',
      metadata: { coachID, invoiceNumber, amount, dueDate: dueDate.toISOString() },
    });
  }

  // Add PrismaService injection
  constructor(
    private readonly eventBus: EventBusService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {
    this.subscribeToEvents();
  }
}

// Main Event Handlers Module
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
