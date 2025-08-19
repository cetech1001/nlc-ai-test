import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { CommunityService } from '../../community/community.service';

@Injectable()
export class AuthEventsHandler {
  private readonly logger = new Logger(AuthEventsHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly communityService: CommunityService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'community-service.auth-events',
      [
        'auth.coach.registered',
        'auth.coach.verified',
        'auth.client.registered',
        'auth.client.connected',
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
        case 'auth.client.connected':
          await this.handleClientConnected(payload);
          break;
      }
    } catch (error) {
      this.logger.error('Failed to handle auth event:', error);
    }
  }

  private async handleCoachRegistered(payload: any) {
    try {
      // Create coach's community
      await this.communityService.createCoachCommunity(payload.coachID);

      // Add coach to the global coach-to-coach community
      await this.communityService.addCoachToCoachCommunity(payload.coachID);

      this.logger.log(`Communities created for new coach ${payload.coachID}`);
    } catch (error) {
      this.logger.error(`Failed to create communities for coach ${payload.coachID}:`, error);
    }
  }

  private async handleCoachVerified(payload: any) {
    // Coach verification doesn't require additional community actions
    // but we could add them here if needed
    this.logger.log(`Coach ${payload.coachID} verified - communities already created`);
  }

  private async handleClientRegistered(payload: any) {
    try {
      // Add client to their coach's community
      await this.communityService.addClientToCoachCommunity(
        payload.clientID,
        payload.coachID
      );

      this.logger.log(`Client ${payload.clientID} added to coach ${payload.coachID}'s community`);
    } catch (error) {
      this.logger.error(`Failed to add client ${payload.clientID} to coach community:`, error);
    }
  }

  private async handleClientConnected(payload: any) {
    try {
      // Ensure client is in the coach's community
      await this.communityService.addClientToCoachCommunity(
        payload.clientID,
        payload.coachID
      );

      this.logger.log(`Client ${payload.clientID} connected to coach ${payload.coachID}'s community`);
    } catch (error) {
      this.logger.error(`Failed to connect client ${payload.clientID} to coach community:`, error);
    }
  }
}
