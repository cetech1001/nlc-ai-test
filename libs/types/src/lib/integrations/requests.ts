export class ConnectPlatformRequest {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookSecret?: string;
  config?: any;
}

export interface LoadCalendlyEventsRequest {
  startDate: string;
  endDate: string;
}
