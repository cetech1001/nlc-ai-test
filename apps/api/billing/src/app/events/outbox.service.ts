import {Cron} from "@nestjs/schedule";
import {Injectable} from "@nestjs/common";
import {BaseEvent, EventBusService} from "@nlc-ai/api-messaging";
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class OutboxService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService
  ) {}

  async saveAndPublishEvent<T extends BaseEvent>(
    event: T,
    routingKey: string
  ): Promise<void> {
    // Save to outbox in same transaction as business logic
    await this.prisma.$transaction(async (tx) => {
      await tx.eventOutbox.create({
        data: {
          eventId: event.eventId,
          eventType: event.eventType,
          routingKey,
          payload: event,
          status: 'pending',
        },
      });
    });

    // Process outbox events
    await this.processOutboxEvents();
  }

  @Cron('*/10 * * * * *') // Every 10 seconds
  async processOutboxEvents(): Promise<void> {
    const pendingEvents = await this.prisma.eventOutbox.findMany({
      where: { status: 'pending' },
      take: 100,
    });

    for (const outboxEvent of pendingEvents) {
      try {
        await this.eventBus.publish(
          outboxEvent.routingKey,
          outboxEvent.payload as any
        );

        await this.prisma.eventOutbox.update({
          where: { id: outboxEvent.id },
          data: { status: 'published', publishedAt: new Date() },
        });
      } catch (error) {
        await this.prisma.eventOutbox.update({
          where: { id: outboxEvent.id },
          data: {
            status: 'failed',
            retryCount: { increment: 1 },
            lastError: error.message,
          },
        });
      }
    }
  }
}
