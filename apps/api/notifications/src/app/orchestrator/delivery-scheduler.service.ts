import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@nlc-ai/api-database';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DeliverySchedulerService {
  private readonly logger = new Logger(DeliverySchedulerService.name);
  private readonly batchSize: number;
  private readonly maxRetries: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.batchSize = this.configService.get<number>('notifications.performance.batchSize', 100);
    this.maxRetries = this.configService.get<number>('notifications.performance.maxRetries', 3);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processFailedDeliveries() {
    this.logger.log('Processing failed deliveries for retry...');

    try {
      const failedDeliveries = await this.prisma.notificationDelivery.findMany({
        where: {
          status: 'failed',
          retryCount: { lt: this.maxRetries },
        },
        take: this.batchSize,
        orderBy: { createdAt: 'asc' },
      });

      if (failedDeliveries.length === 0) {
        return;
      }

      this.logger.log(`Found ${failedDeliveries.length} failed deliveries to retry`);

      // Process retries (implementation would call channels again)
      for (const delivery of failedDeliveries) {
        await this.retryDelivery(delivery.id);
      }

    } catch (error) {
      this.logger.error('Error processing failed deliveries:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldDeliveries() {
    this.logger.log('Cleaning up old notification deliveries...');

    try {
      const retentionDays = this.configService.get<number>('notifications.performance.retentionDays', 30);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.notificationDelivery.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          status: { in: ['delivered', 'failed'] },
          retryCount: { gte: this.maxRetries },
        },
      });

      this.logger.log(`Cleaned up ${result.count} old delivery records`);
    } catch (error) {
      this.logger.error('Error cleaning up old deliveries:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldNotifications() {
    this.logger.log('Cleaning up old read notifications...');

    try {
      const retentionDays = this.configService.get<number>('notifications.performance.retentionDays', 30);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.notification.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          isRead: true,
        },
      });

      this.logger.log(`Cleaned up ${result.count} old read notifications`);
    } catch (error) {
      this.logger.error('Error cleaning up old notifications:', error);
    }
  }

  private async retryDelivery(deliveryID: string): Promise<void> {
    try {
      await this.prisma.notificationDelivery.update({
        where: { id: deliveryID },
        data: {
          retryCount: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      // Here you would re-trigger the delivery through the orchestrator
      // This is a simplified version - full implementation would reload notification and retry

    } catch (error) {
      this.logger.error(`Failed to retry delivery ${deliveryID}:`, error);
    }
  }

  async getDeliveryStats(): Promise<{
    pending: number;
    delivered: number;
    failed: number;
    retrying: number;
  }> {
    const [pending, delivered, failed, retrying] = await Promise.all([
      this.prisma.notificationDelivery.count({ where: { status: 'pending' } }),
      this.prisma.notificationDelivery.count({ where: { status: 'delivered' } }),
      this.prisma.notificationDelivery.count({ where: { status: 'failed', retryCount: { gte: this.maxRetries } } }),
      this.prisma.notificationDelivery.count({ where: { status: 'failed', retryCount: { lt: this.maxRetries } } }),
    ]);

    return { pending, delivered, failed, retrying };
  }
}
