import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { UserType } from '@nlc-ai/api-types';
import { OrchestratorService } from '../../orchestrator/orchestrator.service';

@Injectable()
export class AuthEventsHandler {
  private readonly logger = new Logger(AuthEventsHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly orchestrator: OrchestratorService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'notifications-service.auth-events',
      [
        'auth.coach.registered',
        'auth.coach.verified',
        'auth.client.registered',
        'auth.client.invited',
        'auth.password.reset',
      ],
      this.handleAuthEvents.bind(this)
    );
  }

  private async handleAuthEvents(event: any) {
    try {
      const { eventType, payload } = event;

      switch (eventType) {
        case 'auth.coach.registered':
          await this.handleCoachRegistered(payload);
          break;
        case 'auth.coach.verified':
          await this.handleCoachVerified(payload);
          break;
        case 'auth.client.registered':
          await this.handleClientRegistered(payload);
          break;
        case 'auth.client.invited':
          await this.handleClientInvited(payload);
          break;
        case 'auth.password.reset':
          await this.handlePasswordReset(payload);
          break;
      }
    } catch (error) {
      this.logger.error('Failed to handle auth event:', error);
    }
  }

  private async handleCoachRegistered(payload: any) {
    await this.orchestrator.sendNotification({
      userID: payload.coachID,
      userType: UserType.coach,
      type: 'welcome',
      title: 'Welcome to Next Level Coach AI! 🎉',
      message: `Hi ${payload.firstName}! Your account has been created successfully. Complete your profile to get started.`,
      actionUrl: '/dashboard/profile',
      priority: 'high',
      metadata: {
        source: 'auth.coach.registered',
        firstName: payload.firstName,
      },
    });

    this.logger.log(`Welcome notification sent to coach ${payload.coachID}`);
  }

  private async handleCoachVerified(payload: any) {
    await this.orchestrator.sendNotification({
      userID: payload.coachID,
      userType: UserType.coach,
      type: 'verification',
      title: 'Account Verified Successfully ✅',
      message: 'Your email has been verified. You now have full access to all features.',
      actionUrl: '/dashboard',
      priority: 'normal',
      metadata: {
        source: 'auth.coach.verified',
      },
    });

    this.logger.log(`Verification notification sent to coach ${payload.coachID}`);
  }

  private async handleClientRegistered(payload: any) {
    await this.orchestrator.sendNotification({
      userID: payload.clientID,
      userType: UserType.client,
      type: 'welcome',
      title: 'Welcome to Your Coaching Journey! 🌟',
      message: `Hi ${payload.firstName}! You've successfully joined your coach's program. Let's get started!`,
      actionUrl: '/dashboard',
      priority: 'high',
      metadata: {
        source: 'auth.client.registered',
        firstName: payload.firstName,
        coachID: payload.coachID,
      },
    });

    this.logger.log(`Welcome notification sent to client ${payload.clientID}`);
  }

  private async handleClientInvited(payload: any) {
    // Note: This goes to the coach, not the invited client
    await this.orchestrator.sendNotification({
      userID: payload.coachID,
      userType: UserType.coach,
      type: 'client_invite',
      title: 'Client Invitation Sent 📧',
      message: `Invitation sent to ${payload.email}. They'll receive an email to join your coaching program.`,
      actionUrl: '/dashboard/clients',
      priority: 'normal',
      metadata: {
        source: 'auth.client.invited',
        invitedEmail: payload.email,
        inviteID: payload.inviteID,
      },
    });

    this.logger.log(`Client invite notification sent to coach ${payload.coachID}`);
  }

  private async handlePasswordReset(payload: any) {
    /*let userType: UserType;
    switch (payload.userType) {
      case 'coach':
        userType = UserType.coach;
        break;
      case 'admin':
        userType = UserType.admin;
        break;
      case 'client':
        userType = UserType.client;
        break;
      default:
        this.logger.warn(`Unknown user type for password reset: ${payload.userType}`);
        return;
    }*/

    // This would need the userID, which might not be in the email-only event
    // You might need to look up the user by email first
    this.logger.log(`Password reset notification for ${payload.email} (${payload.userType})`);
  }
}
