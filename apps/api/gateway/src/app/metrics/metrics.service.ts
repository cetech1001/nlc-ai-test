import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceRegistryService } from '../proxy/service-registry.service';
import { CircuitBreakerService } from '../proxy/circuit-breaker.service';
import { CacheService } from '../cache/cache.service';
import {CircuitState} from "@nlc-ai/api-types";

@Injectable()
export class MetricsService {
  private readonly startTime = Date.now();
  private requestCount = 0;
  private errorCount = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly serviceRegistry: ServiceRegistryService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly cacheService: CacheService,
  ) {}

  incrementRequestCount(): void {
    this.requestCount++;
  }

  incrementErrorCount(): void {
    this.errorCount++;
  }

  getMetrics() {
    const uptime = Date.now() - this.startTime;
    const services = this.serviceRegistry.getAllServices();
    const cacheStats = this.cacheService.getStats();

    return {
      gateway: {
        uptime: uptime,
        uptimeHuman: this.formatUptime(uptime),
        version: this.configService.get('gateway.service.version'),
        environment: this.configService.get('gateway.service.environment'),
        requestCount: this.requestCount,
        errorCount: this.errorCount,
        errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      },
      services: services.map(service => ({
        name: service.name,
        url: service.url,
        circuit: this.circuitBreaker.getCircuitState(service.name) as CircuitState,
      })),
      cache: {
        size: cacheStats.size,
        hitRate: 0, // TODO: Implement hit rate tracking
      },
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }

  async getHealthStatus() {
    const services = this.serviceRegistry.getAllServices();
    const serviceHealthChecks = await Promise.allSettled(
      services.map(service => this.checkServiceHealth(service))
    );

    const healthyServices = serviceHealthChecks.filter(
      result => result.status === 'fulfilled' && result.value.healthy
    ).length;

    const overallHealth = healthyServices === services.length ? 'healthy' :
      healthyServices > services.length / 2 ? 'degraded' : 'unhealthy';

    return {
      status: overallHealth,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      services: serviceHealthChecks.map((result, index) => ({
        name: services[index].name,
        ...((result.status === 'fulfilled' ? result.value : { healthy: false, error: 'Connection failed' }))
      })),
      gateway: {
        healthy: true,
        responseTime: process.hrtime()[0],
        memory: process.memoryUsage(),
      },
    };
  }

  private async checkServiceHealth(service: any): Promise<{ healthy: boolean; responseTime?: number; error?: string }> {
    try {
      const startTime = Date.now();

      // Simple HTTP check to service health endpoint
      const response = await fetch(`${service.url}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const responseTime = Date.now() - startTime;

      return {
        healthy: response.ok,
        responseTime,
      };
    } catch (error: any) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
