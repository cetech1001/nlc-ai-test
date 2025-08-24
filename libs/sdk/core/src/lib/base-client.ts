import {ServiceError} from "./service-error";
import {ApiResponse, RequestOptions, ServiceClientConfig} from "./types";

export abstract class BaseClient {
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

    // Handle different body types
    const isFormData = options?.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      ...options?.headers,
    };

    // Don't set Content-Type for FormData - let browser handle it
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    let body: any;
    if (options?.body) {
      if (isFormData) {
        body = options.body; // FormData
      } else {
        body = JSON.stringify(options.body); // JSON
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json() as ApiResponse<T>;
      } else {
        // Handle non-JSON responses
        return {
          success: true,
          data: await response.text() as any,
          meta: {
            timestamp: new Date().toISOString(),
            path,
            method,
          }
        };
      }
    } catch (error) {
      throw this.transformError(error);
    }
  }

  protected async handleErrorResponse(response: Response): Promise<ServiceError> {
    try {
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const errorData: any = await response.json();
        return new ServiceError(
          errorData.error?.message || errorData.message || 'Unknown error',
          response.status,
          errorData.error?.code || errorData.code,
          errorData.error?.details || errorData.details
        );
      } else {
        const errorText = await response.text();
        return new ServiceError(
          errorText || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }
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

    if (error.name === 'AbortError') {
      return new ServiceError('Request timeout', 408);
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new ServiceError('Network error', 0);
    }

    return new ServiceError(error.message || 'Unknown error', 500);
  }

  updateApiKey(apiKey: string | null) {
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }
}
