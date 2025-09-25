export interface ServiceClientConfig {
  baseURL: string;
  apiKey?: string;
  leadsPublicToken?: string;
  timeout?: number;
  getToken?: () => string | null;
}
