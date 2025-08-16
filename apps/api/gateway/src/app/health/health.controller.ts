import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { Public } from '@nlc-ai/api-auth';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    const servicesConfig = this.configService.get('gateway.services');

    const healthChecks = [
      // Memory check
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ];

    // Add service health checks
    Object.entries(servicesConfig).forEach(([name, config]: [string, any]) => {
      if (config.url) {
        healthChecks.push(
          () => this.http.pingCheck(name, `${config.url}/health`, {
            timeout: 3000,
          })
        );
      }
    });

    return this.health.check(healthChecks);
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }

  @Get('live')
  @Public()
  @HealthCheck()
  live() {
    return this.health.check([]);
  }
}
