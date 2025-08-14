import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '@nlc-ai/api-database';
import { HealthService } from './health.service';
import { JwtAuthGuard, UserTypes, UserTypesGuard } from '@nlc-ai/api-auth';
import { UserType } from '@nlc-ai/api-types';
import { Public } from '@nlc-ai/api-auth';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: PrismaHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly healthService: HealthService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  async check() {
    return this.health.check([
      () => this.db.pingCheck('database', this.prisma),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'Service ready' })
  async ready() {
    return this.health.check([
      () => this.db.pingCheck('database', this.prisma),
      // Add more readiness checks for dependencies
    ]);
  }

  @Get('live')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ status: 200, description: 'Service alive' })
  async live() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }

  @Get('email')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.admin, UserType.coach)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detailed email system health check' })
  @ApiResponse({ status: 200, description: 'Email system health retrieved' })
  async emailHealth() {
    return this.healthService.getFullHealthCheck();
  }

  @Get('email/detailed')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detailed system status including email service' })
  @ApiResponse({ status: 200, description: 'Detailed system status retrieved' })
  async detailedStatus() {
    return this.healthService.getDetailedSystemStatus();
  }

  @Post('email/test')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send test email to verify system functionality' })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  async sendTestEmail(
    @Body() body: { email: string },
  ) {
    return this.healthService.sendTestEmail(body.email);
  }

  @Get('metrics')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiResponse({ status: 200, description: 'System metrics retrieved' })
  async getMetrics() {
    const emailHealth = await this.healthService.getFullHealthCheck();

    return {
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      email: {
        pendingEmails: emailHealth.metrics.pendingEmails,
        processingEmails: emailHealth.metrics.processingEmails,
        recentFailureRate: emailHealth.metrics.recentFailureRate,
        avgProcessingTime: emailHealth.metrics.avgProcessingTime,
        lastSuccessfulSend: emailHealth.metrics.lastSuccessfulSend,
        overallStatus: emailHealth.overall.status,
      },
      components: Object.entries(emailHealth.components).map(([name, component]) => ({
        name,
        status: component.status,
        message: component.message,
      })),
    };
  }
}
