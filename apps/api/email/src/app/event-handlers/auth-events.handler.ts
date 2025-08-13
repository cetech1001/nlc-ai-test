import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { EmailService } from '../email/email.service';
import {getWelcomeEmailTemplate} from "../email/templates/auth";

@Injectable()
export class AuthEventsHandler {
  private readonly logger = new Logger(AuthEventsHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly emailService: EmailService
  ) {
    (() => this.subscribeToEvents())();
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
  }

  private async handleVerificationRequested(event: any) {
    try {
      const { email, type, code } = event.payload;

      if (type === 'email_verification') {
        await this.emailService.sendVerificationEmail(email, code);
      } else if (type === 'password_reset') {
        await this.emailService.sendPasswordResetEmail(email, code);
      }

      this.logger.log(`Handled verification request for ${email}`);
    } catch (error) {
      this.logger.error('Failed to handle verification request:', error);
    }
  }

  private async handleCoachRegistered(event: any) {
    try {
      const { email, firstName } = event.payload;
      const html = getWelcomeEmailTemplate(firstName, '');

      // Send welcome email (implement template)
      await this.emailService.sendEmail({
        to: email,
        subject: 'Welcome to Next Level Coach AI!',
        html,
        templateID: 'welcome-coach',
      });

      this.logger.log(`Sent welcome email to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send welcome email:', error);
    }
  }
}
