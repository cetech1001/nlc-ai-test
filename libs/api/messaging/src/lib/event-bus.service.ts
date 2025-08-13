import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { BaseEvent } from './events';
import { v4 as uuid } from 'uuid';

@Injectable()
export class EventBusService {
  private connection: amqp.ChannelModel | undefined;
  private channel: amqp.Channel | undefined;
  private readonly logger = new Logger(EventBusService.name);

  constructor(private configService: ConfigService) {}

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(
        this.configService.get('RABBITMQ_URL', '')
      );
      this.channel = await this.connection.createChannel();

      // Setup exchanges
      await this.channel.assertExchange('nlc.domain.events', 'topic', {
        durable: true,
      });

      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  async publish<T extends BaseEvent>(
    routingKey: string,
    event: Omit<T, 'eventID' | 'occurredAt' | 'producer' | 'source'>
  ): Promise<void> {
    const fullEvent: T = {
      ...event,
      eventID: uuid(),
      occurredAt: new Date().toISOString(),
      producer: this.configService.get('SERVICE_NAME', 'unknown'),
      source: `${this.configService.get('SERVICE_NAME')}.${process.env.NODE_ENV}`,
    } as T;

    try {
      const published = this.channel?.publish(
        'nlc.domain.events',
        routingKey,
        Buffer.from(JSON.stringify(fullEvent)),
        {
          persistent: true,
          messageId: fullEvent.eventID,
          timestamp: Date.now(),
          contentType: 'application/json',
        }
      );

      if (!published) {
        throw new Error('Failed to publish event to exchange');
      }

      this.logger.log(`Published event: ${routingKey}`, {
        eventID: fullEvent.eventID,
        routingKey,
      });
    } catch (error) {
      this.logger.error(`Failed to publish event: ${routingKey}`, error);
      throw error;
    }
  }

  async subscribe<T extends BaseEvent>(
    queueName: string,
    routingKeys: string[],
    handler: (event: T) => Promise<void>
  ): Promise<void> {
    try {
      await this.channel?.assertQueue(queueName, {
        durable: true,
      });

      // Bind queue to routing keys
      for (const routingKey of routingKeys) {
        await this.channel?.bindQueue(queueName, 'nlc.domain.events', routingKey);
      }

      await this.channel?.consume(
        queueName,
        async (msg) => {
          if (!msg) return;

          try {
            const event = JSON.parse(msg.content.toString()) as T;
            await handler(event);
            this.channel?.ack(msg);

            this.logger.log(`Processed event: ${event.eventType}`, {
              eventID: event.eventID,
              queue: queueName,
            });
          } catch (error) {
            this.logger.error(`Failed to process event in queue: ${queueName}`, error);

            // Reject and requeue (or send to DLQ)
            this.channel?.nack(msg, false, false);
          }
        },
        { noAck: false }
      );

      this.logger.log(`Subscribed to queue: ${queueName}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to queue: ${queueName}`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
