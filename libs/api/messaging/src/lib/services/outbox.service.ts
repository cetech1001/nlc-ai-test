import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@nlc-ai/api-database';
import {EventBusService} from "./event-bus.service";
import {BaseEvent, type OutboxConfig} from "../types";

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);
  private readonly batchSize: number;
  private readonly maxRetries: number;
  private readonly retentionDays: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly configService: ConfigService,
    config?: OutboxConfig
  ) {
    this.batchSize = config?.batchSize ?? this.configService.get<number>('OUTBOX_BATCH_SIZE', 100);
    this.maxRetries = config?.maxRetries ?? this.configService.get<number>('OUTBOX_MAX_RETRIES', 3);
    this.retentionDays = config?.retentionDays ?? this.configService.get<number>('OUTBOX_RETENTION_DAYS', 7);
  }

  async saveAndPublishEvent<T extends BaseEvent>(
    event: Omit<T, 'eventID' | 'occurredAt' | 'producer' | 'source'>,
    routingKey: string,
    scheduledFor?: Date
  ): Promise<void> {
    const eventID = this.generateEventID();
    const fullEvent: T = {
      ...event,
      eventID,
      occurredAt: new Date().toISOString(),
      producer: this.configService.get<string>('SERVICE_NAME', 'unknown'),
      source: `${this.configService.get<string>('SERVICE_NAME')}.${process.env.NODE_ENV}`,
    } as T;

    try {
      // Save to outbox in transaction
      await this.prisma.eventOutbox.create({
        data: {
          eventID: fullEvent.eventID,
          eventType: fullEvent.eventType,
          routingKey,
          payload: JSON.stringify(fullEvent),
          scheduledFor: scheduledFor || new Date(),
          status: 'pending',
        },
      });

      this.logger.log(`Event saved to outbox: ${fullEvent.eventType}`, {
        eventID: fullEvent.eventID,
        routingKey,
      });

      // Try to publish immediately if not scheduled for later
      if (!scheduledFor || scheduledFor <= new Date()) {
        await this.processOutboxEvents();
      }
    } catch (error) {
      this.logger.error(`Failed to save event to outbox: ${fullEvent.eventType}`, error);
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
          retryCount: { lt: this.maxRetries },
          OR: [
            { scheduledFor: null },
            { scheduledFor: { lte: now } }
          ]
        },
        take: this.batchSize,
        orderBy: { createdAt: 'asc' },
      });

      if (pendingEvents.length === 0) {
        return;
      }

      this.logger.log(`Processing ${pendingEvents.length} outbox events`);

      for (const outboxEvent of pendingEvents) {
        try {
          await this.eventBus.publish(
            outboxEvent.routingKey,
            JSON.parse(outboxEvent.payload as string)
          );

          await this.prisma.eventOutbox.update({
            where: { id: outboxEvent.id },
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
            where: { id: outboxEvent.id },
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

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldEvents(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    const result = await this.prisma.eventOutbox.deleteMany({
      where: {
        status: 'published',
        publishedAt: { lte: cutoffDate },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old outbox events`);
  }

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

  private generateEventID(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
}
