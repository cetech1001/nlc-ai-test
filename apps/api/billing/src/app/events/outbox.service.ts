import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import {PrismaService} from "@nlc-ai/api-database";
import {BaseEvent, EventBusService} from "@nlc-ai/api-messaging";

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);
  private readonly batchSize: number;
  private readonly maxRetries: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly configService: ConfigService
  ) {
    this.batchSize = this.configService.get<number>('billing.performance.outboxBatchSize', 100);
    this.maxRetries = this.configService.get<number>('billing.performance.maxRetries', 3);
  }

  async saveAndPublishEvent<T extends BaseEvent>(
    event: T,
    routingKey: string,
    scheduledFor?: Date
  ): Promise<void> {
    try {
      // Save to outbox in transaction
      await this.prisma.eventOutbox.create({
        data: {
          eventID: event.eventID,
          eventType: event.eventType,
          routingKey,
          payload: JSON.stringify(event),
          scheduledFor: scheduledFor || new Date(),
          status: 'pending',
        },
      });

      this.logger.log(`Event saved to outbox: ${event.eventType}`, {
        eventID: event.eventID,
        routingKey,
      });

      // Try to publish immediately if not scheduled for later
      if (!scheduledFor || scheduledFor <= new Date()) {
        await this.processOutboxEvents();
      }
    } catch (error) {
      this.logger.error(`Failed to save event to outbox: ${event.eventType}`, error);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutboxEvents(): Promise<void> {
    try {
      const now = new Date();
      const pendingEvents = await this.prisma.eventOutbox.findMany({
        where: {
          status: 'pending',
          retryCount: {lt: this.maxRetries},
          OR: [
            {scheduledFor: null},
            {scheduledFor: {lte: now}}
          ]
        },
        take: this.batchSize,
        orderBy: {createdAt: 'asc'},
      });

      if (pendingEvents.length === 0) {
        return;
      }

      this.logger.log(`Processing ${pendingEvents.length} outbox events`);

      for (const outboxEvent of pendingEvents) {
        try {
          await this.eventBus.publish(
            outboxEvent.routingKey,
            outboxEvent.payload as any
          );

          await this.prisma.eventOutbox.update({
            where: {id: outboxEvent.id},
            data: {
              status: 'published',
              publishedAt: new Date(),
              updatedAt: new Date(),
            },
          });

          this.logger.log(`Event published: ${outboxEvent.eventType}`, {
            eventID: outboxEvent.eventID,
          });

        } catch (error) {
          const newRetryCount = outboxEvent.retryCount + 1;
          const status = newRetryCount >= this.maxRetries ? 'failed' : 'pending';

          await this.prisma.eventOutbox.update({
            where: {id: outboxEvent.id},
            data: {
              status,
              retryCount: newRetryCount,
              lastError: error instanceof Error ? error.message : String(error),
              updatedAt: new Date(),
            },
          });

          this.logger.error(`Failed to publish event: ${outboxEvent.eventType}`, {
            eventID: outboxEvent.eventID,
            retryCount: newRetryCount,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    } catch (error) {
      this.logger.error('Error processing outbox events', error);
    }
  }

  // Method to manually retry failed events
  async retryFailedEvents(eventIDs?: string[]): Promise<void> {
    const where: any = { status: 'failed' };
    if (eventIDs && eventIDs.length > 0) {
      where.eventID = { in: eventIDs };
    }

    await this.prisma.eventOutbox.updateMany({
      where,
      data: {
        status: 'pending',
        retryCount: 0,
        lastError: null,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Reset failed events for retry`, { eventIDs });
  }

  // Clean up old processed events
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldEvents(): Promise<void> {
    const retentionDays = 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.eventOutbox.deleteMany({
      where: {
        status: 'published',
        publishedAt: { lte: cutoffDate },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old outbox events`);
  }
}
