import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';

@Injectable()
export class UsersHandler {
  private readonly logger = new Logger(UsersHandler.name);

  constructor(private readonly eventBus: EventBusService) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'email.users',
      [
        'client.message.received',
        'client.milestone.achieved'
      ],
      this.handleClientEvents.bind(this)
    );
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

  private async handleClientMessageReceived(payload: any) {
    const { clientID, threadID } = payload;
    this.logger.log(`Client message received from ${clientID}, thread ${threadID}`);
  }

  private async handleClientMilestone(payload: any) {
    const { clientID, coachID, milestone } = payload;
    await this.sendMilestoneEmail(clientID, coachID, milestone);
  }

  private async sendMilestoneEmail(clientID: string, coachID: string, milestone: string) {
    this.logger.log(`Milestone email triggered for client ${clientID}: ${milestone}`);
  }
}
