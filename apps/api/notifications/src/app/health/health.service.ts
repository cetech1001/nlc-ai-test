import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@nlc-ai/api-database';
import { DeliverySchedulerService } from '../orchestrator/delivery-scheduler.service';

@Injectable()
export class HealthService {
  // private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly deliveryScheduler: DeliverySchedulerService,
  ) {}

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, any>;
    metrics: Record<string, any>;
    timestamp: Date;
  }> {
    const [
      databaseHealth,
      deliveryHealth,
      channelHealth,
      systemMetrics,
    ] = await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.checkDeliveryHealth(),
      this.checkChannelHealth(),
      this.getSystemMetrics(),
    ]);

    const components = {
      database: this.getResultValue(databaseHealth, { status: 'unhealthy', message: 'Check failed' }),
      delivery: this.getResultValue(deliveryHealth, { status: 'unhealthy', message: 'Check failed' }),
      channels: this.getResultValue(channelHealth, { status: 'unhealthy', message: 'Check failed' }),
    };

    const metrics = this.getResultValue(systemMetrics, {
      totalNotifications: 0,
      unreadNotifications: 0,
      recentActivity: 0,
      deliveryStats: {
        pending: 0,
        delivered: 0,
        failed: 0,
        retrying: 0,
      }
    });

    // Determine overall status
    const statuses = Object.values(components).map(c => c.status);
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (statuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (statuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      components,
      metrics,
      timestamp: new Date(),
    };
  }

  private async checkDatabaseHealth(): Promise<{ status: string; message: string; responseTime?: number }> {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      return {
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        message: responseTime < 1000 ? 'Database responsive' : 'Database slow',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
      };
    }
  }

  private async checkDeliveryHealth(): Promise<{ status: string; message: string; stats?: any }> {
    try {
      const stats = await this.deliveryScheduler.getDeliveryStats();
      const failureRate = stats.delivered > 0 ? (stats.failed / (stats.delivered + stats.failed)) * 100 : 0;

      let status = 'healthy';
      let message = 'Delivery system operating normally';

      if (failureRate > 20) {
        status = 'unhealthy';
        message = 'High delivery failure rate';
      } else if (failureRate > 10 || stats.retrying > 100) {
        status = 'degraded';
        message = 'Elevated delivery issues';
      }

      return { status, message, stats };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Delivery health check failed',
      };
    }
  }

  private async checkChannelHealth(): Promise<{ status: string; message: string; channels?: any }> {
    try {
      const channels = {
        email: await this.checkEmailServiceHealth(),
        firebase: await this.checkFirebaseHealth(),
      };

      const unhealthyChannels = Object.entries(channels)
        .filter(([_, health]) => health.status === 'unhealthy')
        .map(([name]) => name);

      let status = 'healthy';
      let message = 'All channels operational';

      if (unhealthyChannels.length > 1) {
        status = 'unhealthy';
        message = `Multiple channels down: ${unhealthyChannels.join(', ')}`;
      } else if (unhealthyChannels.length === 1) {
        status = 'degraded';
        message = `Channel degraded: ${unhealthyChannels[0]}`;
      }

      return { status, message, channels };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Channel health check failed',
      };
    }
  }

  private async checkEmailServiceHealth(): Promise<{ status: string; configured: boolean }> {
    const emailServiceUrl = this.configService.get<string>('notifications.integrations.emailService.url');
    // const emailServiceToken = this.configService.get<string>('notifications.integrations.emailService.token');

    if (!emailServiceUrl) {
      return { status: 'unhealthy', configured: false };
    }

    // In a real implementation, you might ping the email service health endpoint
    return { status: 'healthy', configured: true };
  }

  private async checkFirebaseHealth(): Promise<{ status: string; configured: boolean }> {
    const firebaseProjectID = this.configService.get<string>('notifications.integrations.firebase.projectID');
    const firebasePrivateKey = this.configService.get<string>('notifications.integrations.firebase.privateKey');
    const firebaseClientEmail = this.configService.get<string>('notifications.integrations.firebase.clientEmail');

    if (!firebaseProjectID || !firebasePrivateKey || !firebaseClientEmail) {
      return { status: 'degraded', configured: false };
    }

    return { status: 'healthy', configured: true };
  }

  private async getSystemMetrics(): Promise<{
    totalNotifications: number;
    unreadNotifications: number;
    deliveryStats: any;
    recentActivity: number;
  }> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalNotifications, unreadNotifications, deliveryStats, recentActivity] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { isRead: false } }),
      this.deliveryScheduler.getDeliveryStats(),
      this.prisma.notification.count({ where: { createdAt: { gte: oneDayAgo } } }),
    ]);

    return {
      totalNotifications,
      unreadNotifications,
      deliveryStats,
      recentActivity,
    };
  }

  private getResultValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
    return result.status === 'fulfilled' ? result.value : fallback;
  }

  async sendTestNotification(userID: string, userType: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Test notification creation only (not multi-channel delivery)
      await this.prisma.notification.create({
        data: {
          userID,
          userType,
          type: 'test',
          title: 'Health Check Test',
          message: 'This is a test notification to verify the system is working.',
          priority: 'normal',
          isRead: false,
        },
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
