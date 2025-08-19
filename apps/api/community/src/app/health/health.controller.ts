import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '@nlc-ai/api-database';
import { Public } from '@nlc-ai/api-auth';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', this.prisma),
    ]);
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.db.pingCheck('database', this.prisma),
    ]);
  }
}
