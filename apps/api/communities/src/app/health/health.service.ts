import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getSystemHealth() {
    const [
      databaseHealth,
      systemMetrics,
    ] = await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.getSystemMetrics(),
    ]);

    const components = {
      database: this.getResultValue(databaseHealth, { status: 'unhealthy', message: 'Check failed' }),
    };

    const metrics = this.getResultValue(systemMetrics, {
      totalCommunities: 0,
      totalPosts: 0,
      totalMessages: 0,
      activeCommunities: 0,
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

  private async getSystemMetrics() {
    const [totalCommunities, totalPosts, totalMessages, activeCommunities] = await Promise.all([
      this.prisma.community.count(),
      this.prisma.post.count(),
      this.prisma.directMessage.count(),
      this.prisma.community.count({ where: { isActive: true } }),
    ]);

    return {
      totalCommunities,
      totalPosts,
      totalMessages,
      activeCommunities,
    };
  }

  private getResultValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
    return result.status === 'fulfilled' ? result.value : fallback;
  }
}
