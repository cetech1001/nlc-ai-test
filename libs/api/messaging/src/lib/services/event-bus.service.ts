import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { BaseEvent } from '../types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.ChannelModel | undefined;
  private channel: amqp.Channel | undefined;
  private readonly logger = new Logger(EventBusService.name);
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.ensureConnection();
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  private async ensureConnection(): Promise<void> {
    if (this.connection && this.channel) {
      return;
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = this.connect();

    try {
      await this.connectionPromise;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  private async connect(): Promise<void> {
    try {
      const rabbitmqUrl = this.config.get('RABBITMQ_URL');
      if (!rabbitmqUrl) {
        this.logger.warn('RABBITMQ_URL not configured - events will not be published');
        return;
      }

      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      this.connection.on('error', (error) => {
        this.logger.error('RabbitMQ connection error:', error);
        this.resetConnection();
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
        this.resetConnection();
      });

      this.channel.on('error', (error) => {
        this.logger.error('RabbitMQ channel error:', error);
        this.resetConnection();
      });

      await this.channel.assertExchange(this.config.get('RABBITMQ_EXCHANGE')!, 'topic', {
        durable: true,
      });

      this.logger.log('Connected to RabbitMQ successfully');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      this.resetConnection();
      throw error;
    }
  }

  private resetConnection(): void {
    this.connection = undefined;
    this.channel = undefined;
  }

  async publish<T extends BaseEvent>(
    routingKey: string,
    event: Omit<T, 'eventID' | 'occurredAt' | 'producer' | 'source'>
  ): Promise<void> {
    await this.ensureConnection();

    if (!this.channel) {
      throw new Error('No RabbitMQ connection available');
    }

    const fullEvent: T = {
      ...event,
      eventID: uuid(),
      occurredAt: new Date().toISOString(),
      producer: this.config.get('SERVICE_NAME', 'unknown'),
      source: `${this.config.get('SERVICE_NAME')}.${this.config.get('NODE_ENV')}`,
    } as T;

    try {
      const published = this.channel.publish(
        this.config.get('RABBITMQ_EXCHANGE')!,
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
    await this.ensureConnection();

    if (!this.channel) {
      throw new Error('No RabbitMQ connection available');
    }

    try {
      await this.channel.assertQueue(queueName, {
        durable: true,
      });

      for (const routingKey of routingKeys) {
        await this.channel.bindQueue(queueName, this.config.get('RABBITMQ_EXCHANGE')!, routingKey);
      }

      await this.channel.consume(
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
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = undefined;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = undefined;
      }
      this.logger.log('RabbitMQ connection closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection:', error);
    }
  }
}
