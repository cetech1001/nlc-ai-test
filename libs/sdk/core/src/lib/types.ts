export interface ServiceClientConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
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

export interface Paginated<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

