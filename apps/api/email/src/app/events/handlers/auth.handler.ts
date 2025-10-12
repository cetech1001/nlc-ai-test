import {Injectable, Logger} from "@nestjs/common";
import {EventBusService} from "@nlc-ai/api-messaging";
import {TransactionalService} from "../../transactional/transactional.service";

@Injectable()
export class AuthHandler {
  private readonly logger = new Logger(AuthHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly transactionalService: TransactionalService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'email.auth-verification',
      ['auth.verification.requested'],
      this.handleVerificationRequested.bind(this)
    );

    await this.eventBus.subscribe(
      'email.coach-registration',
      ['auth.coach.registered'],
      this.handleCoachRegistered.bind(this)
    );

    await this.eventBus.subscribe(
      'email.coach-verification',
      ['auth.coach.verified'],
      this.handleCoachVerified.bind(this)
    );

    await this.eventBus.subscribe(
      'email.password-reset',
      ['auth.password.reset'],
      this.handlePasswordReset.bind(this)
    );

    await this.eventBus.subscribe(
      'email.client-invitations',
      ['auth.client.invited'],
      this.handleClientInvited.bind(this)
    );
  }

  private async handleVerificationRequested(event: any) {
    try {
      this.logger.log(`This was called: ${event.payload}`);
      const { email, type, code } = event.payload;

      if (type === 'email_verification') {
        await this.transactionalService.sendVerificationEmail(email, code);
        this.logger.log(`Verification email sent to ${email}`);
      } else if (type === 'password_reset') {
        await this.transactionalService.sendPasswordResetEmail(email, code);
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

      await this.transactionalService.sendWelcomeEmail(email, fullName);
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
      const { email } = event.payload;

      await this.transactionalService.sendPasswordResetConfirmationEmail(email);
      this.logger.log(`Password reset confirmation sent to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send password reset confirmation:', error);
    }
  }

  private async handleClientInvited(event: any) {
    try {
      const {email} = event.payload;

      await this.transactionalService.sendClientInvitationEmail(event.payload);

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
}
