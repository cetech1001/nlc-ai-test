import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { PrismaService } from '@nlc-ai/api-database';
import { ClientsService } from '../clients/clients.service';
import { CoachesService } from '../coaches/coaches.service';

@Injectable()
export class AuthEventsHandler {
  private readonly logger = new Logger(AuthEventsHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly prisma: PrismaService,
    private readonly clientsService: ClientsService,
    private readonly coachesService: CoachesService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    // Subscribe to auth service events that affect user management
    await this.eventBus.subscribe(
      'users-service.auth-events',
      [
        'auth.coach.registered',
        'auth.coach.verified',
        'auth.client.registered',
        'auth.client.connected',
        'auth.profile.updated',
        'auth.avatar.updated'
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
        case 'auth.profile.updated':
          await this.handleProfileUpdated(payload);
          break;
        case 'auth.avatar.updated':
          await this.handleAvatarUpdated(payload);
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to handle auth event: ${event.eventType}`, error);
    }
  }

  private async handleCoachRegistered(payload: any) {
    const { coachID, email, firstName, lastName } = payload;

    try {
      // Verify the coach exists in the database
      const coach = await this.prisma.coach.findUnique({
        where: { id: coachID }
      });

      if (!coach) {
        this.logger.warn(`Coach ${coachID} not found in database after registration event`);
        return;
      }

      this.logger.log(`Coach registration processed: ${email}`);

      // Additional business logic for new coach registration
      // e.g., initialize default settings, create sample data, etc.

    } catch (error) {
      this.logger.error(`Failed to process coach registration: ${coachID}`, error);
    }
  }

  private async handleCoachVerified(payload: any) {
    const { coachID, email } = payload;

    try {
      // Update coach verification status if needed
      await this.prisma.coach.update({
        where: { id: coachID },
        data: {
          isVerified: true,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Coach verification processed: ${email}`);

    } catch (error) {
      this.logger.error(`Failed to process coach verification: ${coachID}`, error);
    }
  }

  private async handleClientRegistered(payload: any) {
    const { clientID, coachID, email, firstName, lastName } = payload;

    try {
      // Verify the client exists
      const client = await this.prisma.client.findUnique({
        where: { id: clientID }
      });

      if (!client) {
        this.logger.warn(`Client ${clientID} not found in database after registration event`);
        return;
      }

      this.logger.log(`Client registration processed: ${email} for coach ${coachID}`);

    } catch (error) {
      this.logger.error(`Failed to process client registration: ${clientID}`, error);
    }
  }

  private async handleClientConnected(payload: any) {
    const { relationshipID, clientID, coachID, email } = payload;

    try {
      // Verify the relationship exists
      const relationship = await this.prisma.clientCoach.findUnique({
        where: { id: relationshipID }
      });

      if (!relationship) {
        this.logger.warn(`Client-coach relationship ${relationshipID} not found`);
        return;
      }

      this.logger.log(`Client connection processed: ${email} connected to coach ${coachID}`);

    } catch (error) {
      this.logger.error(`Failed to process client connection: ${relationshipID}`, error);
    }
  }

  private async handleProfileUpdated(payload: any) {
    const { userID, email, firstName, lastName } = payload;

    try {
      this.logger.log(`Profile update processed for user: ${email}`);

      // Additional processing if needed
      // e.g., update search indices, cache invalidation, etc.

    } catch (error) {
      this.logger.error(`Failed to process profile update: ${userID}`, error);
    }
  }

  private async handleAvatarUpdated(payload: any) {
    const { userID, userType, avatarUrl } = payload;

    try {
      // Update avatar URL in the appropriate table
      switch (userType) {
        case 'coach':
          await this.prisma.coach.update({
            where: { id: userID },
            data: { avatarUrl, updatedAt: new Date() },
          });
          break;
        case 'client':
          await this.prisma.client.update({
            where: { id: userID },
            data: { avatarUrl, updatedAt: new Date() },
          });
          break;
        case 'admin':
          await this.prisma.admin.update({
            where: { id: userID },
            data: { avatarUrl, updatedAt: new Date() },
          });
          break;
      }

      this.logger.log(`Avatar update processed for ${userType}: ${userID}`);

    } catch (error) {
      this.logger.error(`Failed to process avatar update: ${userID}`, error);
    }
  }
}
