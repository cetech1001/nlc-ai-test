import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '@nlc-ai/api-database';
import { JwtAuthGuard, UserTypes, UserTypesGuard } from '@nlc-ai/api-auth';
import { UserType } from '@nlc-ai/types';
import { Public } from '@nlc-ai/api-auth';
import { HealthService } from './health.service';

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

  @Post('test-lead')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create test lead for health verification' })
  @ApiResponse({ status: 200, description: 'Test lead created' })
  async createTestLead() {
    return this.healthService.createTestLead();
  }
}
