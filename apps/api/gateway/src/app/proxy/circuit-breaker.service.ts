import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {CircuitState} from "@nlc-ai/api-types";

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly circuits = new Map<string, CircuitState>();
  private readonly failureThreshold: number;
  private readonly timeout: number;

  constructor(private readonly configService: ConfigService) {
    this.failureThreshold = this.configService.get('gateway.circuitBreaker.failureThreshold', 5);
    this.timeout = this.configService.get('gateway.circuitBreaker.timeout', 10000);
  }

  canExecute(serviceName: string): boolean {
    const circuit = this.getOrCreateCircuit(serviceName);
    const now = Date.now();

    switch (circuit.state) {
      case 'CLOSED':
        return true;

      case 'OPEN':
        if (now - circuit.lastFailureTime >= this.timeout) {
          circuit.state = 'HALF_OPEN';
          this.logger.log(`Circuit breaker for ${serviceName} moved to HALF_OPEN`);
          return true;
        }
        return false;

      case 'HALF_OPEN':
        return true;

      default:
        return true;
    }
  }

  recordSuccess(serviceName: string): void {
    const circuit = this.getOrCreateCircuit(serviceName);

    if (circuit.state === 'HALF_OPEN') {
      circuit.state = 'CLOSED';
      circuit.failureCount = 0;
      this.logger.log(`Circuit breaker for ${serviceName} closed after successful request`);
    } else if (circuit.state === 'CLOSED') {
      circuit.failureCount = Math.max(0, circuit.failureCount - 1);
    }
  }

  recordFailure(serviceName: string): void {
    const circuit = this.getOrCreateCircuit(serviceName);
    circuit.failureCount++;
    circuit.lastFailureTime = Date.now();

    if (circuit.state === 'HALF_OPEN') {
      circuit.state = 'OPEN';
      this.logger.warn(`Circuit breaker for ${serviceName} opened after failure in HALF_OPEN state`);
    } else if (circuit.failureCount >= this.failureThreshold && circuit.state === 'CLOSED') {
      circuit.state = 'OPEN';
      this.logger.warn(`Circuit breaker for ${serviceName} opened after ${circuit.failureCount} failures`);
    }
  }

  getCircuitState(serviceName: string): CircuitState {
    return this.getOrCreateCircuit(serviceName);
  }

  private getOrCreateCircuit(serviceName: string): CircuitState {
    if (!this.circuits.has(serviceName)) {
      this.circuits.set(serviceName, {
        failureCount: 0,
        lastFailureTime: 0,
        state: 'CLOSED',
      });
    }
    return this.circuits.get(serviceName)!;
  }
}
