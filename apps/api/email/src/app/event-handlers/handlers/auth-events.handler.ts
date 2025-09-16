import {Injectable, Logger} from "@nestjs/common";
import {EventBusService} from "@nlc-ai/api-messaging";
import {AppService} from "../../app.service";

@Injectable()
export class AuthEventsHandler {
  private readonly logger = new Logger(AuthEventsHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly emailService: AppService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'email-service.auth-verification',
      ['auth.verification.requested'],
      this.handleVerificationRequested.bind(this)
    );

    await this.eventBus.subscribe(
      'email-service.coach-registration',
      ['auth.coach.registered'],
      this.handleCoachRegistered.bind(this)
    );

    await this.eventBus.subscribe(
      'email-service.coach-verification',
      ['auth.coach.verified'],
      this.handleCoachVerified.bind(this)
    );

    await this.eventBus.subscribe(
      'email-service.password-reset',
      ['auth.password.reset'],
      this.handlePasswordReset.bind(this)
    );

    await this.eventBus.subscribe(
      'email-service.client-invitations',
      ['auth.client.invited'],
      this.handleClientInvited.bind(this)
    );
  }

  private async handleVerificationRequested(event: any) {
    try {
      this.logger.log(`This was called: ${event.payload}`);
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

      await this.emailService.sendWelcomeEmail(email, fullName);
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send welcome email:', error);
    }
  }

  private async handleCoachVerified(event: any) {
    try {
      const { email, coachID } = event.payload;

      await this.sendOnboardingSequence(coachID, email);
      this.logger.log(`Onboarding sequence initiated for ${email}`);
    } catch (error) {
      this.logger.error('Failed to handle coach verification:', error);
    }
  }

  private async handlePasswordReset(event: any) {
    try {
      const { email, userType } = event.payload;

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
    /*const onboardingEmails = [
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
      await this.scheduleOnboardingEmail(coachID, email, emailData, scheduledFor);
    }*/
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
            <p>Best regards,<br>The {{appName}} Team</p>
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

    const subject = `You've been invited to join {{businessName}}`;
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
            <p style="margin: 0; opacity: 0.9;">Join {{businessName}}</p>
          </div>
          <div class="content">
            <h2 style="color: #FEBEFA;">Welcome to Your Coaching Journey</h2>
            <p>Hi there!</p>
            <p>{{coachName}} has invited you to join their coaching program. This is the beginning of an exciting journey toward achieving your goals!</p>

            <div class="message-box">
              <h3 style="color: #FEBEFA; margin-top: 0;">Personal Message from {{coachName}}:</h3>
              <p style="margin-bottom: 0;">{{message}}</p>
            </div>

            <p style="text-align: center;">
              <a href="{{inviteUrl}}" class="button">Accept Invitation</a>
            </p>

            <p style="font-size: 14px; color: #a0a0a0;">{{expiryText}}</p>

            <p>If you have any questions, feel free to reply to this email.</p>

            <p>Looking forward to working with you!</p>
            <p><strong>{{coachName}}</strong><br>
            {{businessNameTagline}}</p>
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
