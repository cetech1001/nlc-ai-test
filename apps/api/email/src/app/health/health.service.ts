import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@nlc-ai/api-database';
import { AppService } from '../app.service';
import { EmailSchedulerService } from '../email/email-scheduler.service';
import {EmailHealthStatus, EmailSystemHealth} from "@nlc-ai/api-types";

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly emailService: AppService,
    private readonly emailSchedulerService: EmailSchedulerService,
  ) {}

  async getFullHealthCheck(): Promise<EmailSystemHealth> {
    const [
      mailgunConfig,
      database,
      scheduler,
      queueHealth,
      recentPerformance,
      metrics
    ] = await Promise.allSettled([
      this.checkMailgunConfiguration(),
      this.checkDatabaseHealth(),
      this.checkSchedulerHealth(),
      this.checkQueueHealth(),
      this.checkRecentPerformance(),
      this.getSystemMetrics(),
    ]);

    const components = {
      mailgunConfig: this.getResultValue(mailgunConfig, 'Mailgun configuration check failed'),
      database: this.getResultValue(database, 'Database check failed'),
      scheduler: this.getResultValue(scheduler, 'Scheduler check failed'),
      queueHealth: this.getResultValue(queueHealth, 'Queue health check failed'),
      recentPerformance: this.getResultValue(recentPerformance, 'Performance check failed'),
    };

    const systemMetrics = this.getResultValue(metrics, {
      pendingEmails: -1,
      processingEmails: -1,
      recentFailureRate: -1,
      avgProcessingTime: -1,
    });

    const overall = this.calculateOverallHealth(components);

    return {
      overall,
      components,
      metrics: systemMetrics,
    };
  }

  private async checkMailgunConfiguration(): Promise<EmailHealthStatus> {
    try {
      const apiKey = this.configService.get<string>('email.mailgun.apiKey');
      const domain = this.configService.get<string>('email.mailgun.domain');
      const fromEmail = this.configService.get<string>('email.mailgun.fromEmail');

      if (!apiKey || !domain || !fromEmail) {
        return {
          status: 'unhealthy',
          message: 'Mailgun configuration incomplete',
          timestamp: new Date(),
          details: {
            hasApiKey: !!apiKey,
            hasDomain: !!domain,
            hasFromEmail: !!fromEmail,
          },
        };
      }

      // Check if we can connect to Mailgun (simplified check)
      const emailHealth = await this.emailService.checkEmailHealth();

      return {
        status: emailHealth.mailgunConfigured && emailHealth.domainVerified ? 'healthy' : 'degraded',
        message: emailHealth.mailgunConfigured
          ? (emailHealth.domainVerified ? 'Mailgun fully configured' : 'Domain not verified')
          : 'Mailgun not properly configured',
        timestamp: new Date(),
        details: {
          configured: emailHealth.mailgunConfigured,
          domainVerified: emailHealth.domainVerified,
          recentSendRate: emailHealth.recentSendRate,
          recentFailureRate: emailHealth.recentFailureRate,
          lastSuccessfulSend: emailHealth.lastSuccessfulSend,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Failed to check Mailgun configuration',
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  private async checkDatabaseHealth(): Promise<EmailHealthStatus> {
    try {
      // Test database connectivity with a simple query
      await this.prisma.$queryRaw`SELECT 1`;

      // Check for critical email tables
      const emailCount = await this.prisma.emailMessage.count({
        take: 1,
      });

      const scheduledCount = await this.prisma.scheduledEmail.count({
        take: 1,
      });

      return {
        status: 'healthy',
        message: 'Database connection healthy',
        timestamp: new Date(),
        details: {
          emailTableAccessible: true,
          scheduledEmailTableAccessible: true,
          testQuerySuccessful: true,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  private async checkSchedulerHealth(): Promise<EmailHealthStatus> {
    try {
      const schedulerHealth = await this.emailSchedulerService.getSystemHealth();

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let message = 'Email scheduler running normally';

      if (!schedulerHealth.isHealthy) {
        if (schedulerHealth.issues.length > 2) {
          status = 'unhealthy';
          message = 'Email scheduler has critical issues';
        } else {
          status = 'degraded';
          message = 'Email scheduler has some issues';
        }
      }

      return {
        status,
        message,
        timestamp: new Date(),
        details: {
          isHealthy: schedulerHealth.isHealthy,
          pendingEmails: schedulerHealth.pendingEmails,
          processingEmails: schedulerHealth.processingEmails,
          recentFailureRate: schedulerHealth.recentFailureRate,
          avgProcessingTime: schedulerHealth.avgProcessingTime,
          lastProcessedAt: schedulerHealth.lastProcessedAt,
          issues: schedulerHealth.issues,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Failed to check scheduler health',
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  private async checkQueueHealth(): Promise<EmailHealthStatus> {
    try {
      const queueStats = await this.emailService.getEmailQueueStats();

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let message = 'Email queue operating normally';

      // Check for concerning queue conditions
      if (queueStats.pending > 1000) {
        status = 'degraded';
        message = 'High number of pending emails';
      }

      if (queueStats.processing > 100) {
        status = 'degraded';
        message = 'Many emails stuck in processing';
      }

      if (queueStats.failed > queueStats.sent * 0.1) {
        status = 'unhealthy';
        message = 'High failure rate detected';
      }

      return {
        status,
        message,
        timestamp: new Date(),
        details: {
          pending: queueStats.pending,
          processing: queueStats.processing,
          failed: queueStats.failed,
          sent: queueStats.sent,
          failureRate: queueStats.sent > 0 ? (queueStats.failed / queueStats.sent) * 100 : 0,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Failed to check queue health',
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  private async checkRecentPerformance(): Promise<EmailHealthStatus> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [recentSent, recentFailed, dailySent, dailyFailed] = await Promise.all([
        this.prisma.scheduledEmail.count({
          where: {
            status: 'sent',
            sentAt: { gte: oneHourAgo },
          },
        }),
        this.prisma.scheduledEmail.count({
          where: {
            status: 'failed',
            updatedAt: { gte: oneHourAgo },
          },
        }),
        this.prisma.scheduledEmail.count({
          where: {
            status: 'sent',
            sentAt: { gte: oneDayAgo },
          },
        }),
        this.prisma.scheduledEmail.count({
          where: {
            status: 'failed',
            updatedAt: { gte: oneDayAgo },
          },
        }),
      ]);

      const hourlyFailureRate = recentSent > 0 ? (recentFailed / recentSent) * 100 : 0;
      const dailyFailureRate = dailySent > 0 ? (dailyFailed / dailySent) * 100 : 0;

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let message = 'Email performance is good';

      if (hourlyFailureRate > 10) {
        status = 'unhealthy';
        message = 'High recent failure rate';
      } else if (dailyFailureRate > 5) {
        status = 'degraded';
        message = 'Elevated failure rate';
      } else if (recentSent === 0 && dailySent === 0) {
        status = 'degraded';
        message = 'No emails sent recently';
      }

      return {
        status,
        message,
        timestamp: new Date(),
        details: {
          recentSent,
          recentFailed,
          dailySent,
          dailyFailed,
          hourlyFailureRate: Math.round(hourlyFailureRate * 100) / 100,
          dailyFailureRate: Math.round(dailyFailureRate * 100) / 100,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Failed to check recent performance',
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  private async getSystemMetrics(): Promise<{
    pendingEmails: number;
    processingEmails: number;
    recentFailureRate: number;
    avgProcessingTime: number;
    lastSuccessfulSend?: Date;
  }> {
    try {
      const [queueStats, schedulerHealth] = await Promise.all([
        this.emailService.getEmailQueueStats(),
        this.emailSchedulerService.getSystemHealth(),
      ]);

      const lastSuccess = await this.prisma.scheduledEmail.findFirst({
        where: { status: 'sent' },
        orderBy: { sentAt: 'desc' },
        select: { sentAt: true },
      });

      return {
        pendingEmails: queueStats.pending,
        processingEmails: queueStats.processing,
        recentFailureRate: schedulerHealth.recentFailureRate,
        avgProcessingTime: schedulerHealth.avgProcessingTime,
        lastSuccessfulSend: lastSuccess?.sentAt,
      };
    } catch (error) {
      this.logger.error('Failed to get system metrics:', error);
      return {
        pendingEmails: -1,
        processingEmails: -1,
        recentFailureRate: -1,
        avgProcessingTime: -1,
      };
    }
  }

  private calculateOverallHealth(components: Record<string, EmailHealthStatus>): EmailHealthStatus {
    const statuses = Object.values(components).map(c => c.status);

    if (statuses.includes('unhealthy')) {
      return {
        status: 'unhealthy',
        message: 'One or more critical email components are unhealthy',
        timestamp: new Date(),
      };
    }

    if (statuses.includes('degraded')) {
      return {
        status: 'degraded',
        message: 'Some email components are experiencing issues',
        timestamp: new Date(),
      };
    }

    return {
      status: 'healthy',
      message: 'All email components are healthy',
      timestamp: new Date(),
    };
  }

  private getResultValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
    return result.status === 'fulfilled' ? result.value : fallback;
  }

  async sendTestEmail(to: string): Promise<{ success: boolean; messageID?: string; error?: string }> {
    try {
      const result = await this.emailService.sendEmail({
        to,
        subject: 'Email System Health Test',
        html: `
          <h2>Email System Health Test</h2>
          <p>This is a test email to verify that the email system is functioning correctly.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
          <p>If you received this email, the system is working properly.</p>
        `,
        text: `Email System Health Test - Sent at: ${new Date().toISOString()}`,
        templateID: 'health-test',
      });

      return {
        success: result.status === 200,
        messageID: result.messageID,
        error: result.status !== 200 ? result.message : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getDetailedSystemStatus(): Promise<{
    emailService: EmailSystemHealth;
    uptime: number;
    timestamp: Date;
  }> {
    const emailService = await this.getFullHealthCheck();

    return {
      emailService,
      uptime: process.uptime(),
      timestamp: new Date(),
    };
  }
}
