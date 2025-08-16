import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ServiceConfig {
  name: string;
  url: string;
  timeout: number;
  healthPath?: string;
  weight?: number;
}

@Injectable()
export class ServiceRegistryService {
  private readonly logger = new Logger(ServiceRegistryService.name);
  private readonly services = new Map<string, ServiceConfig>();

  constructor(private readonly configService: ConfigService) {
    this.initializeServices();
  }

  private initializeServices() {
    const servicesConfig = this.configService.get('gateway.services');

    Object.entries(servicesConfig).forEach(([name, config]: [string, any]) => {
      if (config.url) {
        this.registerService({
          name,
          url: config.url,
          timeout: config.timeout || 30000,
          healthPath: '/health',
          weight: 1,
        });
      }
    });

    this.logger.log(`Registered ${this.services.size} services`);
  }

  registerService(config: ServiceConfig): void {
    this.services.set(config.name, config);
    this.logger.log(`Registered service: ${config.name} -> ${config.url}`);
  }

  getService(name: string): ServiceConfig | undefined {
    return this.services.get(name);
  }

  getAllServices(): ServiceConfig[] {
    return Array.from(this.services.values());
  }

  isServiceRegistered(name: string): boolean {
    return this.services.has(name);
  }

  updateServiceHealth(name: string, isHealthy: boolean): void {
    const service = this.services.get(name);
    if (service) {
      (service as any).isHealthy = isHealthy;
      (service as any).lastHealthCheck = new Date();
    }
  }
}
