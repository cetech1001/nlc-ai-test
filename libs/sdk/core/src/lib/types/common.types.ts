export interface ServiceClientConfig {
  baseURL: string;
  apiKey?: string;
  antiSpamToken?: string;
  timeout?: number;
  getToken?: () => string | null;
}
