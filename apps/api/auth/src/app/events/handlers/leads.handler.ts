import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { CoachAuthService } from '../../auth/services/coach-auth.service';
import {UserType} from '@nlc-ai/types';
import {AuthService} from "../../auth/auth.service";

@Injectable()
export class LeadsHandler {
  private readonly logger = new Logger(LeadsHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly coachAuth: CoachAuthService,
    private readonly auth: AuthService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'auth.landing-leads',
      ['lead.landing.submitted'],
      this.handleLandingLeadSubmitted.bind(this)
    );
  }

  private async handleLandingLeadSubmitted(event: any) {
    try {
      const { leadID, name, email, qualified, marketingOptIn } = event.payload;

      this.logger.log(`Landing lead submitted: ${leadID} (qualified: ${qualified})`);

      if (!qualified) {
        this.logger.log(`Lead ${leadID} is not qualified, skipping coach account creation`);
        return;
      }

      await this.createCoachAccountForLead(leadID, name, email, marketingOptIn);
    } catch (error) {
      this.logger.error('Failed to handle landing lead submission:', error);
    }
  }

  private async createCoachAccountForLead(
    leadID: string,
    name: string,
    email: string,
    marketingOptIn: boolean
  ) {
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(' ') || '';

      this.logger.log(`Creating coach account for qualified lead: ${email}`);

      try {
        await this.coachAuth.register({
          firstName,
          lastName,
          email,
          marketingOptIn,
          password: this.generateTemporaryPassword(),
          triggerPasswordReset: true,
        });

        this.logger.log(`Coach account created successfully for lead ${leadID}`);

      } catch (error: any) {
        if (error.status === 409 || error.message?.includes('already exists')) {
          this.logger.warn(`Coach account already exists for email: ${email}`);

          await this.sendPasswordResetForExistingCoach(email);
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(`Failed to create coach account for lead ${leadID}:`, error);
    }
  }

  private async sendPasswordResetForExistingCoach(email: string) {
    try {
      await this.auth.forgotPassword({ email }, UserType.COACH);

      this.logger.log(`Password reset initiated for existing coach: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset to existing coach ${email}:`, error);
    }
  }

  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-12) + 'A1!';
  }
}
