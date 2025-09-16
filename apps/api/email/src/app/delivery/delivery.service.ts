import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@nlc-ai/api-database';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    @InjectQueue('email-delivery') private deliveryQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async sendThreadReply(messageID: string): Promise<void> {
    await this.deliveryQueue.add('send-thread-reply', { messageID });
  }

  async sendCoachEmail(messageID: string): Promise<void> {
    await this.deliveryQueue.add('send-coach-email', { messageID });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processPendingMessages() {
    const pendingMessages = await this.prisma.emailMessage.findMany({
      where: {
        status: 'pending',
        sentAt: { lte: new Date() },
      },
      take: 50,
      include: {
        emailThread: true,
      },
    });

    for (const message of pendingMessages) {
      try {
        if (message.emailThread?.clientID) {
          await this.sendThreadReply(message.id);
        } else {
          await this.sendCoachEmail(message.id);
        }
      } catch (error: any) {
        this.logger.error(`Failed to queue message ${message.id}:`, error);
      }
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanupOldEmails() {
    const days = this.configService.get<number>('email.performance.retentionDays', 90);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.prisma.emailMessage.deleteMany({
      where: {
        sentAt: {
          lt: cutoffDate,
        },
        status: { in: ['sent', 'bounced', 'failed'] },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old email records`);
    return { deletedCount: result.count };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async retryFailedEmails() {
    await this.prisma.emailMessage.updateMany({
      where: {
        status: 'failed',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      data: {
        status: 'pending',
      },
    });
  }
}
