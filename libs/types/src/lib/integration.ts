import {Coach} from "./coach";
import {WebhookEvent} from "./webhook";

export interface Integration {
  id: string;
  coachID: string;
  integrationType: 'social' | 'app' | 'course';
  platformName: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  apiKey?: string | null;
  webhookSecret?: string | null;
  config?: any | null;
  syncSettings?: any | null;
  isActive?: boolean | null;
  lastSyncAt?: Date | null;
  syncError?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  coach?: Coach;
  webhookEvents?: WebhookEvent[];
}

export interface PlatformConnectionRequest {
  accessToken?: string;
  refreshToken?: string;
  profileData?: any;
  tokenExpiresAt?: string;
  apiKey?: string;
  subdomain?: string;
  schoolUrl?: string;
  groupUrl?: string;
  zapierApiKey?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface IntegrationProvider {
  platformName: string;
  integrationType: 'social' | 'course' | 'app';
  authType: 'oauth' | 'api_key' | 'webhook';

  connect(coachID: string, credentials: any): Promise<Integration>;
  test(integration: Integration): Promise<TestResult>;
  sync(integration: Integration): Promise<SyncResult>;
  disconnect(integration: Integration): Promise<void>;

  refreshToken?(integration: Integration): Promise<string>;
  getAuthUrl?(coachID: string): Promise<{ authUrl: string; state: string }>;
  handleCallback?(coachID: string, code: string, state: string): Promise<Integration>;

  fetchScheduledEvents?(accessToken: string, userUri: string, startDate?: string, endDate?: string, status?: string):
    Promise<any>;
}

export interface CreateIntegrationData {
  coachID: string;
  integrationType: string;
  platformName: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  config: any;
  syncSettings: any;
  isActive: boolean;
}

export interface TestResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
}

export enum INTEGRATION_TYPE {
  social = 'social',
  course = 'course',
  app = 'app',
}

export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}
