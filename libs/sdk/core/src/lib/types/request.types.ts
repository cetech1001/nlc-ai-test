export interface RequestOptions {
  headers?: Record<string, string>;
  body?: any;
}

export interface SearchQuery {
  page?: number;
  limit?: number;
  search?: string;
}
