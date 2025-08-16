import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyService } from './proxy.service';
import { ServiceRegistryService } from './service-registry.service';
import { LoadBalancerService } from './load-balancer.service';
import { CircuitBreakerService } from './circuit-breaker.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
  ],
  providers: [
    ProxyService,
    ServiceRegistryService,
    LoadBalancerService,
    CircuitBreakerService,
  ],
  exports: [
    ProxyService,
    CircuitBreakerService,
    ServiceRegistryService,
  ],
})
export class ProxyModule {}
