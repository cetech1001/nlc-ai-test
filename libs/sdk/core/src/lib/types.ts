export interface ServiceClientConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
}

export interface NLCClientConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
  services?: {
    auth?: string;
    users?: string;
    leads?: string;
    email?: string;
    billing?: string;
    analytics?: string;
  };
}

export interface RequestOptions {
  headers?: Record<string, string>;
  body?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    path: string;
    method: string;
    requestID?: string;
  };
}
