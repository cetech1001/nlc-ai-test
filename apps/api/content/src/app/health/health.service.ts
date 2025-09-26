import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@nlc-ai/api-database';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, any>;
    metrics: Record<string, any>;
    timestamp: Date;
  }> {
    const [
      databaseHealth,
      oauthHealth,
      systemMetrics,
    ] = await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.checkOAuthHealth(),
      this.getSystemMetrics(),
    ]);

    const components = {
      database: this.getResultValue(databaseHealth, { status: 'unhealthy', message: 'Check failed' }),
      oauth: this.getResultValue(oauthHealth, { status: 'unhealthy', message: 'Check failed' }),
    };

    const metrics = this.getResultValue(systemMetrics, {
      totalIntegrations: 0,
      activeIntegrations: 0,
      totalEmailAccounts: 0,
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

  private async checkOAuthHealth(): Promise<{ status: string; message: string; configs?: any }> {
    try {
      const configs = {
        google: {
          configured: !!(this.configService.get('integrations.oauth.google.clientID') &&
            this.configService.get('integrations.oauth.google.clientSecret')),
        },
        microsoft: {
          configured: !!(this.configService.get('integrations.oauth.microsoft.clientID') &&
            this.configService.get('integrations.oauth.microsoft.clientSecret')),
        },
        calendly: {
          configured: !!(this.configService.get('integrations.oauth.calendly.clientID') &&
            this.configService.get('integrations.oauth.calendly.clientSecret')),
        },
      };

      const configuredCount = Object.values(configs).filter(c => c.configured).length;
      const totalConfigs = Object.keys(configs).length;

      let status = 'healthy';
      let message = 'All OAuth providers configured';

      if (configuredCount === 0) {
        status = 'unhealthy';
        message = 'No OAuth providers configured';
      } else if (configuredCount < totalConfigs) {
        status = 'degraded';
        message = `${configuredCount}/${totalConfigs} OAuth providers configured`;
      }

      return { status, message, configs };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'OAuth health check failed',
      };
    }
  }

  private async getSystemMetrics(): Promise<{
    totalIntegrations: number;
    activeIntegrations: number;
    totalEmailAccounts: number;
    recentActivity: number;
  }> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalIntegrations, activeIntegrations, totalEmailAccounts, recentActivity] = await Promise.all([
      this.prisma.integration.count(),
      this.prisma.integration.count({ where: { isActive: true } }),
      this.prisma.emailAccount.count(),
      this.prisma.integration.count({ where: { lastSyncAt: { gte: oneDayAgo } } }),
    ]);

    return {
      totalIntegrations,
      activeIntegrations,
      totalEmailAccounts,
      recentActivity,
    };
  }

  private getResultValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
    return result.status === 'fulfilled' ? result.value : fallback;
  }

  async sendTestIntegration(userID: string, platform: string): Promise<{ success: boolean; error?: string }> {
    try {
      const integration = await this.prisma.integration.findFirst({
        where: {
          coachID: userID,
          platformName: platform,
          isActive: true,
        },
      });

      if (!integration) {
        return {
          success: false,
          error: `No active ${platform} integration found for user`,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
