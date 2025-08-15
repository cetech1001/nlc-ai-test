export interface AuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface IntegrationStatusResponse {
  isConnected: boolean;
  lastSync?: Date;
  [key: string]: any; // For platform-specific config data
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

export interface EmailAccountStatsResponse {
  totalThreads: number;
  totalMessages: number;
  unreadThreads: number;
  lastSync: Date | null;
  syncEnabled: boolean;
}

export interface EmailAccountActionResponse {
  success: boolean;
  message: string;
}

export interface CalendlyEventsResponse {
  events: any[];
  total: number;
}
