import {Injectable} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {NotificationsService} from '../notifications/notifications.service';
import {UserType} from '@nlc-ai/api-types';
import {NotificationPriority} from "../notifications/dto";

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, any>;
    metrics: Record<string, any>;
    timestamp: Date;
  }> {
    const [databaseHealth, systemMetrics] = await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.getSystemMetrics(),
    ]);

    const components = {
      database: this.getResultValue(databaseHealth, { status: 'unhealthy', message: 'Check failed' }),
    };

    const metrics = this.getResultValue(systemMetrics, {
      totalNotifications: 0,
      unreadNotifications: 0,
      recentActivity: 0,
    });

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

  private async getSystemMetrics(): Promise<{
    totalNotifications: number;
    unreadNotifications: number;
    recentActivity: number;
  }> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalNotifications, unreadNotifications, recentActivity] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { isRead: false } }),
      this.prisma.notification.count({ where: { createdAt: { gte: oneDayAgo } } }),
    ]);

    return {
      totalNotifications,
      unreadNotifications,
      recentActivity,
    };
  }

  private getResultValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
    return result.status === 'fulfilled' ? result.value : fallback;
  }

  async sendTestNotification(userID: string, userType: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.notificationsService.createNotification({
        userID,
        userType: userType as UserType,
        type: 'test',
        title: 'Health Check Test',
        message: 'This is a test notification to verify the system is working.',
        priority: NotificationPriority.NORMAL,
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
