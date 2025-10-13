import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { PrismaService } from '@nlc-ai/api-database';
import { SendService } from '../../send/send.service';
import { ConfigService } from '@nestjs/config';
import { EmailStatus, UserType } from '@nlc-ai/types';

@Injectable()
export class UsersHandler {
  private readonly logger = new Logger(UsersHandler.name);
  private readonly systemFromEmail: string;

  constructor(
    private readonly eventBus: EventBusService,
    private readonly prisma: PrismaService,
    private readonly sendService: SendService,
    private readonly configService: ConfigService,
  ) {
    this.systemFromEmail = this.configService.get<string>(
      'email.mailgun.fromEmail',
      'support@nextlevelcoach.ai'
    );
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
    // TODO: Trigger coach notification
  }

  private async handleClientMilestone(payload: any) {
    const { clientID, coachID, milestone } = payload;
    await this.sendMilestoneEmail(clientID, coachID, milestone);
  }

  private async sendMilestoneEmail(clientID: string, coachID: string, milestone: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientID },
      select: { email: true, firstName: true },
    });

    if (!client) return;

    const message = await this.prisma.emailMessage.create({
      data: {
        userID: coachID,
        userType: UserType.COACH,
        from: this.systemFromEmail,
        to: client.email,
        emailTemplateID: 'client_milestone',
        status: EmailStatus.PENDING,
        metadata: {
          type: 'notification',
          milestone,
          clientName: client.firstName,
        },
      },
    });

    await this.sendService.sendSystemEmail(message.id);
    this.logger.log(`Milestone email queued for client ${clientID}: ${milestone}`);
  }
}
