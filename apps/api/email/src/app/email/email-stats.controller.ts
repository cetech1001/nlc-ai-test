import {Body, Controller, Get, Param, Post, Query, UseGuards} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType } from '@nlc-ai/api-types';
import {EmailService} from "./email.service";
import {EmailSchedulerService} from "./email-scheduler.service";
import {PrismaService} from "@nlc-ai/api-database";

@ApiTags('Email Statistics')
@Controller('email-stats')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach)
@ApiBearerAuth()
export class EmailStatsController {
  constructor(
    private readonly emailService: EmailService,
    private readonly emailSchedulerService: EmailSchedulerService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get email statistics overview for coach' })
  @ApiResponse({ status: 200, description: 'Email statistics retrieved successfully' })
  async getEmailOverview(
    @CurrentUser('id') coachID: string,
    @Query('days') days?: string,
  ) {
    const daysParsed = days ? parseInt(days) : 30;
    const dateRange = {
      start: new Date(Date.now() - daysParsed * 24 * 60 * 60 * 1000),
      end: new Date(),
    };

    const [emailStats, schedulerStats, coachStats] = await Promise.all([
      this.emailService.getEmailStats(coachID, dateRange),
      this.emailSchedulerService.getEmailStats(),
      this.emailSchedulerService.getCoachEmailStats(coachID, daysParsed),
    ]);

    return {
      period: {
        days: daysParsed,
        startDate: dateRange.start,
        endDate: dateRange.end,
      },
      emailStats,
      schedulerStats,
      coachStats,
    };
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get email performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  async getEmailPerformance(
    @CurrentUser('id') coachID: string,
    @Query('days') days?: string,
  ) {
    const daysParsed = days ? parseInt(days) : 30;
    const dateRange = {
      start: new Date(Date.now() - daysParsed * 24 * 60 * 60 * 1000),
      end: new Date(),
    };

    const stats = await this.emailService.getEmailStats(coachID, dateRange);

    // Calculate engagement metrics
    const engagementScore = stats.totalSent > 0
      ? ((stats.totalOpened * 0.3) + (stats.totalClicked * 0.7)) / stats.totalSent * 100
      : 0;

    const deliverabilityScore = stats.totalSent > 0
      ? ((stats.totalSent - stats.totalBounced) / stats.totalSent) * 100
      : 100;

    return {
      period: {
        days: daysParsed,
        startDate: dateRange.start,
        endDate: dateRange.end,
      },
      metrics: {
        ...stats,
        engagementScore: Math.round(engagementScore * 100) / 100,
        deliverabilityScore: Math.round(deliverabilityScore * 100) / 100,
      },
      trends: {
        // You could add trend calculations here comparing to previous periods
        openRateTrend: 0,
        clickRateTrend: 0,
        bounceRateTrend: 0,
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Get email system health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  async getEmailHealth(@CurrentUser('id') coachID: string) {
    const [systemHealth, emailHealth] = await Promise.all([
      this.emailSchedulerService.getSystemHealth(),
      this.emailService.checkEmailHealth(),
    ]);

    return {
      systemHealth,
      emailHealth,
      overallStatus: systemHealth.isHealthy && emailHealth.mailgunConfigured ? 'healthy' : 'degraded',
      timestamp: new Date(),
    };
  }

  @Get('queue-status')
  @ApiOperation({ summary: 'Get email queue status' })
  @ApiResponse({ status: 200, description: 'Queue status retrieved successfully' })
  async getQueueStatus(@CurrentUser('id') coachID: string) {
    const [queueStats, coachStats] = await Promise.all([
      this.emailService.getEmailQueueStats(),
      this.emailSchedulerService.getCoachEmailStats(coachID),
    ]);

    return {
      global: queueStats,
      coach: coachStats,
      timestamp: new Date(),
    };
  }

  @Get('templates-usage')
  @ApiOperation({ summary: 'Get template usage analytics' })
  @ApiResponse({ status: 200, description: 'Template usage analytics retrieved successfully' })
  async getTemplateUsage(
    @CurrentUser('id') coachID: string,
    @Query('days') days?: string,
  ) {
    const daysParsed = days ? parseInt(days) : 30;

    // Get top used templates
    const templates = await this.prisma.emailTemplate.findMany({
      where: {
        coachID,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        category: true,
        usageCount: true,
        lastUsedAt: true,
      },
      orderBy: {
        usageCount: 'desc',
      },
      take: 10,
    });

    return {
      period: {
        days: daysParsed,
      },
      topTemplates: templates,
      totalTemplates: templates.length,
    };
  }
}

// Email Management Controller for admin operations
@Controller('admin/email-management')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.admin)
@ApiBearerAuth()
export class EmailManagementController {
  constructor(
    private readonly emailService: EmailService,
    private readonly emailSchedulerService: EmailSchedulerService,
  ) {}

  @Get('system-stats')
  @ApiOperation({ summary: 'Get system-wide email statistics' })
  async getSystemStats(@Query('days') days?: string) {
    const daysParsed = days ? parseInt(days) : 30;
    const dateRange = {
      start: new Date(Date.now() - daysParsed * 24 * 60 * 60 * 1000),
      end: new Date(),
    };

    const stats = await this.emailService.getEmailStats(undefined, dateRange);
    const queueStats = await this.emailService.getEmailQueueStats();
    const health = await this.emailSchedulerService.getSystemHealth();

    return {
      period: {
        days: daysParsed,
        startDate: dateRange.start,
        endDate: dateRange.end,
      },
      stats,
      queueStats,
      health,
    };
  }

  @Post('retry-failed')
  @ApiOperation({ summary: 'Retry failed emails system-wide' })
  async retryFailedEmails(@Query('limit') limit?: string) {
    const limitParsed = limit ? parseInt(limit) : 50;
    return this.emailSchedulerService.retryFailedEmails(undefined, limitParsed);
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Cleanup old email records' })
  async cleanupEmails(@Query('days') days?: string) {
    const daysParsed = days ? parseInt(days) : 90;
    return this.emailService.cleanupOldEmails(daysParsed);
  }

  @Post('emergency-pause/:coachID')
  @ApiOperation({ summary: 'Emergency pause all emails for a coach' })
  async emergencyPause(
    @Param('coachID') coachID: string,
    @Body() body: { reason: string },
  ) {
    return this.emailSchedulerService.pauseAllEmailsForCoach(coachID, body.reason);
  }

  @Post('emergency-resume/:coachID')
  @ApiOperation({ summary: 'Resume all emails for a coach after emergency pause' })
  async emergencyResume(@Param('coachID') coachID: string) {
    return this.emailSchedulerService.resumeAllEmailsForCoach(coachID);
  }

  @Get('coach/:coachID/stats')
  @ApiOperation({ summary: 'Get email statistics for specific coach' })
  async getCoachStats(
    @Param('coachID') coachID: string,
    @Query('days') days?: string,
  ) {
    const daysParsed = days ? parseInt(days) : 30;
    return this.emailSchedulerService.getCoachEmailStats(coachID, daysParsed);
  }
}
