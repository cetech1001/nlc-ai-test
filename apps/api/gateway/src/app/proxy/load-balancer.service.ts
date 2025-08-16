import { Injectable } from '@nestjs/common';
import { ServiceConfig } from './service-registry.service';

@Injectable()
export class LoadBalancerService {
  private roundRobinCounters = new Map<string, number>();

  selectInstance(serviceName: string, instances: ServiceConfig[]): ServiceConfig | null {
    if (instances.length === 0) {
      return null;
    }

    if (instances.length === 1) {
      return instances[0];
    }

    // Simple round-robin load balancing
    const counter = this.roundRobinCounters.get(serviceName) || 0;
    const selectedInstance = instances[counter % instances.length];

    this.roundRobinCounters.set(serviceName, counter + 1);

    return selectedInstance;
  }

  // Weighted round-robin (for future use)
  selectWeightedInstance(serviceName: string, instances: ServiceConfig[]): ServiceConfig | null {
    if (instances.length === 0) {
      return null;
    }

    const totalWeight = instances.reduce((sum, instance) => sum + (instance.weight || 1), 0);
    const random = Math.random() * totalWeight;

    let weightSum = 0;
    for (const instance of instances) {
      weightSum += instance.weight || 1;
      if (random <= weightSum) {
        return instance;
      }
    }

    return instances[0];
  }
}
