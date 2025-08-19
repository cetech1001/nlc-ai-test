import { Injectable, Logger, BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {firstValueFrom, timeout, catchError, retry, ObservableInput, timer} from 'rxjs';
import { ServiceRegistryService } from './service-registry.service';
import { CircuitBreakerService } from './circuit-breaker.service';

export interface ProxyRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
}

export interface ProxyResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly serviceRegistry: ServiceRegistryService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  async proxyRequest<T = any>(
    serviceName: string,
    path: string,
    request: ProxyRequest
  ): Promise<ProxyResponse<T>> {
    const serviceConfig = this.serviceRegistry.getService(serviceName);

    if (!serviceConfig) {
      throw new ServiceUnavailableException(`Service ${serviceName} is not available`);
    }

    // Check circuit breaker
    if (!this.circuitBreaker.canExecute(serviceName)) {
      throw new ServiceUnavailableException(`${serviceName} service is temporarily unavailable`);
    }

    const fullUrl = `${serviceConfig.url}${path}`;
    const requestTimeout = serviceConfig.timeout || 30000;

    this.logger.debug(`Proxying ${request.method} request to: ${fullUrl}`);

    try {
      const startTime = Date.now();

      const response = await firstValueFrom(
        this.httpService.request({
          method: request.method,
          url: fullUrl,
          headers: {
            ...request.headers,
            'X-Gateway-Request-ID': this.generateRequestID(),
            'X-Forwarded-For': request.headers?.['x-forwarded-for'] || 'gateway',
          },
          data: request.data,
          params: request.params,
          timeout: requestTimeout,
          validateStatus: () => true, // Don't throw on HTTP error status codes
        }).pipe(
          timeout(requestTimeout),
          retry({
            count: 2,
            delay: (error, retryCount): ObservableInput<any> => {
              this.logger.warn(`Retrying request to ${serviceName} (attempt ${retryCount}):`, error.message);
              return timer(1000 * retryCount); // Exponential backoff
            },
          }),
          catchError((error) => {
            this.circuitBreaker.recordFailure(serviceName);
            throw error;
          })
        )
      );

      const duration = Date.now() - startTime;
      this.circuitBreaker.recordSuccess(serviceName);

      this.logger.debug(`Request to ${serviceName} completed in ${duration}ms with status ${response.status}`);

      // Transform response
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
      };

    } catch (error: any) {
      this.logger.error(`Request to ${serviceName} failed:`, error.message);
      this.circuitBreaker.recordFailure(serviceName);

      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        throw new ServiceUnavailableException(`Request to ${serviceName} timed out`);
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new BadGatewayException(`Cannot connect to ${serviceName} service`);
      }

      throw new BadGatewayException(`Service ${serviceName} error: ${error.message}`);
    }
  }

  private generateRequestID(): string {
    return `gw-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
