import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { LeadsService } from '../leads/leads.service';
import { LeadType, LeadStatus } from '@nlc-ai/api-types';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly leadsService: LeadsService,
  ) {}

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, any>;
    metrics: Record<string, any>;
    timestamp: Date;
  }> {
    const [
      databaseHealth,
      leadsHealth,
      systemMetrics,
    ] = await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.checkLeadsHealth(),
      this.getSystemMetrics(),
    ]);

    const components = {
      database: this.getResultValue(databaseHealth, { status: 'unhealthy', message: 'Check failed' }),
      leads: this.getResultValue(leadsHealth, { status: 'unhealthy', message: 'Check failed' }),
    };

    const metrics = this.getResultValue(systemMetrics, {
      totalLeads: 0,
      recentLeads: 0,
      conversionRate: 0,
      landingPageLeads: 0,
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

  private async checkLeadsHealth(): Promise<{ status: string; message: string; stats?: any }> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [recentLeads, totalLeads] = await Promise.all([
        this.prisma.lead.count({
          where: { createdAt: { gte: oneDayAgo } }
        }),
        this.prisma.lead.count(),
      ]);

      const stats = { recentLeads, totalLeads };

      return {
        status: 'healthy',
        message: 'Leads service operational',
        stats,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Leads health check failed',
      };
    }
  }

  private async getSystemMetrics(): Promise<{
    totalLeads: number;
    recentLeads: number;
    conversionRate: number;
    landingPageLeads: number;
  }> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalLeads, recentLeads, convertedLeads, landingPageLeads] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { createdAt: { gte: oneDayAgo } } }),
      this.prisma.lead.count({
        where: {
          status: LeadStatus.CONVERTED,
          createdAt: { gte: oneWeekAgo }
        }
      }),
      this.prisma.lead.count({
        where: {
          leadType: LeadType.ADMIN_LEAD,
          createdAt: { gte: oneWeekAgo }
        }
      }),
    ]);

    const weeklyLeads = await this.prisma.lead.count({
      where: { createdAt: { gte: oneWeekAgo } }
    });

    const conversionRate = weeklyLeads > 0 ? (convertedLeads / weeklyLeads) * 100 : 0;

    return {
      totalLeads,
      recentLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      landingPageLeads,
    };
  }

  private getResultValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
    return result.status === 'fulfilled' ? result.value : fallback;
  }

  async createTestLead(): Promise<{ success: boolean; leadID?: string; error?: string }> {
    try {
      const testLead = await this.leadsService.create({
        name: 'Health Check Test Lead',
        email: `test-${Date.now()}@healthcheck.nlc-ai.com`,
        source: 'health-check',
        status: LeadStatus.CONTACTED,
        notes: 'This is a test lead created for health verification',
      });

      // Clean up test lead
      setTimeout(async () => {
        try {
          await this.leadsService.remove(testLead.id);
          this.logger.log(`Cleaned up test lead: ${testLead.id}`);
        } catch (error) {
          this.logger.warn(`Failed to clean up test lead: ${testLead.id}`, error);
        }
      }, 5000);

      return { success: true, leadID: testLead.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
