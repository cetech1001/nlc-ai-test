import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Cron, CronExpression} from '@nestjs/schedule';
import {v4 as uuid} from "uuid";
import {PrismaService} from '@nlc-ai/api-database';
import {EventBusService} from "./event-bus.service";
import {BaseEvent, isEventCritical, type OutboxConfig} from "../types";

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);
  private readonly batchSize: number;
  private readonly maxRetries: number;
  private readonly retentionDays: number;
  private readonly dlqRetentionDays: number;
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly configService: ConfigService,
    config?: OutboxConfig
  ) {
    this.batchSize = Number(config?.batchSize ?? this.configService.get<number>('OUTBOX_BATCH_SIZE', 100));
    this.maxRetries = Number(config?.maxRetries ?? this.configService.get<number>('OUTBOX_MAX_RETRIES', 3));
    this.retentionDays = Number(config?.retentionDays ?? this.configService.get<number>('OUTBOX_RETENTION_DAYS', 7));
    this.dlqRetentionDays = Number(config?.dlqRetentionDays ?? this.configService.get<number>('DLQ_RETENTION_DAYS', 30));
  }

  async saveAndPublishEvent<T extends BaseEvent>(
    event: Omit<T, 'eventID' | 'occurredAt' | 'producer' | 'source'>,
    routingKey: string,
    scheduledFor?: Date
  ): Promise<void> {
    const eventID = uuid();
    const fullEvent: T = {
      ...event,
      eventID,
      occurredAt: new Date().toISOString(),
      producer: this.configService.get<string>('SERVICE_NAME', 'unknown'),
      source: `${this.configService.get<string>('SERVICE_NAME')}.${process.env.NODE_ENV}`,
    } as T;

    try {
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

      if (!scheduledFor || scheduledFor <= new Date()) {
        setImmediate(() => {
          this.processOutboxEvents().catch(error => {
            this.logger.error('Error in immediate outbox processing:', error);
          });
        });
      }
    } catch (error) {
      this.logger.error(`Failed to save event to outbox: ${fullEvent.eventType}`, error);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutboxEvents(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

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
        take: Number(this.batchSize),
        orderBy: { createdAt: 'asc' },
      });

      if (pendingEvents.length === 0) {
        return;
      }

      this.logger.log(`Processing ${pendingEvents.length} outbox events`);

      for (const outboxEvent of pendingEvents) {
        try {
          const eventPayload = JSON.parse(outboxEvent.payload as string);

          await this.eventBus.publish(
            outboxEvent.routingKey,
            eventPayload
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

          if (newRetryCount >= this.maxRetries) {
            await this.handleMaxRetriesReached(outboxEvent, error);
          } else {
            await this.prisma.eventOutbox.update({
              where: { id: outboxEvent.id },
              data: {
                status: 'pending',
                retryCount: newRetryCount,
                lastError: error instanceof Error ? error.message : String(error),
                updatedAt: new Date(),
              },
            });

            this.logger.warn(`Event retry ${newRetryCount}/${this.maxRetries}: ${outboxEvent.eventType}`, {
              eventID: outboxEvent.eventID,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }
    } catch (error) {
      this.logger.error('Error processing outbox events', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async handleMaxRetriesReached(outboxEvent: any, error: unknown): Promise<void> {
    const isCritical = isEventCritical(outboxEvent.routingKey);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (isCritical) {
      await this.moveToDLQ(outboxEvent, errorMessage);

      this.logger.error(`Critical event moved to DLQ after ${outboxEvent.retryCount + 1} attempts`, {
        eventID: outboxEvent.eventID,
        eventType: outboxEvent.eventType,
        routingKey: outboxEvent.routingKey,
        error: errorMessage,
      });
    } else {
      await this.logAndDelete(outboxEvent, errorMessage);

      this.logger.warn(`Non-critical event deleted after ${outboxEvent.retryCount + 1} failed attempts`, {
        eventID: outboxEvent.eventID,
        eventType: outboxEvent.eventType,
        routingKey: outboxEvent.routingKey,
        error: errorMessage,
      });
    }
  }

  private async moveToDLQ(outboxEvent: any, errorMessage: string): Promise<void> {
    try {
      await this.prisma.deadLetterQueue.create({
        data: {
          originalEventID: outboxEvent.eventID,
          eventType: outboxEvent.eventType,
          routingKey: outboxEvent.routingKey,
          payload: outboxEvent.payload,
          failureReason: errorMessage,
          retryCount: outboxEvent.retryCount + 1,
          originalCreatedAt: outboxEvent.createdAt,
          status: 'pending_review',
        },
      });

      await this.prisma.eventOutbox.update({
        where: { id: outboxEvent.id },
        data: {
          status: 'moved_to_dlq',
          lastError: `Moved to DLQ after ${outboxEvent.retryCount + 1} attempts: ${errorMessage}`,
          updatedAt: new Date(),
        },
      });

      // TODO: Send alert to ops team (integrate with your alerting service)
      // await this.alertingService.sendDLQAlert(outboxEvent);

    } catch (dlqError) {
      this.logger.error('Failed to move event to DLQ', {
        eventID: outboxEvent.eventID,
        originalError: errorMessage,
        dlqError: dlqError instanceof Error ? dlqError.message : String(dlqError),
      });

      await this.prisma.eventOutbox.update({
        where: { id: outboxEvent.id },
        data: {
          status: 'failed',
          lastError: `Failed to move to DLQ: ${dlqError instanceof Error ? dlqError.message : String(dlqError)}`,
          updatedAt: new Date(),
        },
      });
    }
  }

  private async logAndDelete(outboxEvent: any, errorMessage: string): Promise<void> {
    try {
      this.logger.log('Deleting non-critical failed event', {
        eventID: outboxEvent.eventID,
        eventType: outboxEvent.eventType,
        routingKey: outboxEvent.routingKey,
        payload: outboxEvent.payload,
        failureReason: errorMessage,
        retryCount: outboxEvent.retryCount + 1,
        originalCreatedAt: outboxEvent.createdAt,
      });

      await this.prisma.eventOutbox.delete({
        where: { id: outboxEvent.id },
      });

    } catch (deleteError) {
      this.logger.error('Failed to delete failed event', {
        eventID: outboxEvent.eventID,
        error: deleteError instanceof Error ? deleteError.message : String(deleteError),
      });

      await this.prisma.eventOutbox.update({
        where: { id: outboxEvent.id },
        data: {
          status: 'failed',
          lastError: errorMessage,
          updatedAt: new Date(),
        },
      });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldEvents(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      const result = await this.prisma.eventOutbox.deleteMany({
        where: {
          status: 'published',
          publishedAt: { lte: cutoffDate },
        },
      });

      this.logger.log(`Cleaned up ${result.count} old outbox events`);
    } catch (error) {
      this.logger.error('Error cleaning up old events:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldDLQEvents(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.dlqRetentionDays);

      const result = await this.prisma.deadLetterQueue.deleteMany({
        where: {
          status: { in: ['reviewed', 'discarded'] },
          reviewedAt: { lte: cutoffDate },
        },
      });

      this.logger.log(`Cleaned up ${result.count} old DLQ events`);
    } catch (error) {
      this.logger.error('Error cleaning up old DLQ events:', error);
    }
  }


  async getDLQEvents(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.deadLetterQueue.findMany({
      where,
      orderBy: { movedToDLQAt: 'desc' },
    });
  }

  async getDLQEventByID(id: string) {
    return this.prisma.deadLetterQueue.findUnique({
      where: { id },
    });
  }

  async requeueDLQEvent(id: string, reviewedBy: string): Promise<void> {
    const dlqEvent = await this.prisma.deadLetterQueue.findUnique({
      where: { id },
    });

    if (!dlqEvent) {
      throw new Error('DLQ event not found');
    }

    try {
      await this.prisma.eventOutbox.create({
        data: {
          eventID: dlqEvent.originalEventID,
          eventType: dlqEvent.eventType,
          routingKey: dlqEvent.routingKey,
          payload: dlqEvent.payload,
          status: 'pending',
          retryCount: 0,
          scheduledFor: new Date(),
        },
      });

      await this.prisma.deadLetterQueue.update({
        where: { id },
        data: {
          status: 'requeued',
          reviewedAt: new Date(),
          reviewedBy,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`DLQ event requeued: ${dlqEvent.eventType}`, {
        eventID: dlqEvent.originalEventID,
        reviewedBy,
      });

      setImmediate(() => {
        this.processOutboxEvents().catch(error => {
          this.logger.error('Error in immediate outbox processing after requeue:', error);
        });
      });

    } catch (error) {
      this.logger.error('Failed to requeue DLQ event', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async reviewDLQEvent(id: string, reviewedBy: string, reviewNotes: string, discard: boolean = false): Promise<void> {
    await this.prisma.deadLetterQueue.update({
      where: { id },
      data: {
        status: discard ? 'discarded' : 'reviewed',
        reviewedAt: new Date(),
        reviewedBy,
        reviewNotes,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`DLQ event ${discard ? 'discarded' : 'reviewed'}: ${id}`, {
      reviewedBy,
      reviewNotes,
    });
  }

  async getDLQStats() {
    return this.prisma.deadLetterQueue.groupBy({
      by: ['eventType', 'status'],
      _count: true,
    });
  }
}
