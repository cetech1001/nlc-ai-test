export interface AuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface IntegrationStatusResponse {
  isConnected: boolean;
  lastSync?: Date;
  [key: string]: any;
}

export interface SupportedPlatformsResponse {
  social: string[];
  app: string[];
  course: string[];
  all: string[];
}

export interface IntegrationTestResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface IntegrationSyncResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface CalendlyEventsResponse {
  events: any[];
  total: number;
}
