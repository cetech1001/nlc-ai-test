import {ServiceError} from "./service-error";
import {ApiResponse, RequestOptions, ServiceClientConfig} from "./types";

export abstract class BaseServiceClient {
  protected baseURL: string;
  protected apiKey?: string;
  protected timeout: number = 30000;

  constructor(config: ServiceClientConfig) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      ...options?.headers,
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json() as any;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  protected async handleErrorResponse(response: Response): Promise<ServiceError> {
    try {
      const errorData: any = await response.json();
      return new ServiceError(
        errorData.error?.message || 'Unknown error',
        response.status,
        errorData.error?.code,
        errorData.error?.details
      );
    } catch {
      return new ServiceError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }
  }

  protected transformError(error: any): ServiceError {
    if (error instanceof ServiceError) {
      return error;
    }

    if (error.name === 'TimeoutError') {
      return new ServiceError('Request timeout', 408);
    }

    return new ServiceError(error.message || 'Unknown error', 500);
  }
}
