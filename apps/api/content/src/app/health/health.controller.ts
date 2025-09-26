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
import { JwtAuthGuard, UserTypes, UserTypesGuard, Public } from '@nlc-ai/api-auth';
import { UserType } from '@nlc-ai/api-types';

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

  @Get('detailed')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detailed system health check' })
  @ApiResponse({ status: 200, description: 'Detailed health status retrieved' })
  async detailedHealth() {
    return this.healthService.getSystemHealth();
  }

  @Post('test-integration')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test integration for user' })
  @ApiResponse({ status: 200, description: 'Integration test completed' })
  async testIntegration(
    @Body() body: { userID: string; platform: string },
  ) {
    return this.healthService.sendTestIntegration(body.userID, body.platform);
  }
}
