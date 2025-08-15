import {AuthType, IntegrationType} from "./enums";

export interface Integration {
  id: string;
  coachID: string;
  integrationType: IntegrationType;
  platformName: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  apiKey?: string | null;
  webhookSecret?: string | null;
  config: any;
  syncSettings?: any | null;
  isActive?: boolean | null;
  lastSyncAt?: Date | null;
  syncError?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface EmailAccount {
  id: string;
  coachID: string;
  emailAddress: string;
  provider: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  isPrimary?: boolean | null;
  isActive?: boolean | null;
  syncEnabled?: boolean | null;
  lastSyncAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
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

export interface CreateIntegrationData {
  coachID: string;
  integrationType: IntegrationType;
  platformName: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  apiKey?: string;
  webhookSecret?: string;
  config: any;
  syncSettings?: any;
  isActive: boolean;
}

export interface IntegrationProvider {
  platformName: string;
  integrationType: IntegrationType;
  authType: AuthType;

  connect(coachID: string, credentials: any): Promise<Integration>;
  test(integration: Integration): Promise<TestResult>;
  sync(integration: Integration): Promise<SyncResult>;
  disconnect(integration: Integration): Promise<void>;

  getAuthUrl?(coachID: string): Promise<{ authUrl: string; state: string }>;
  handleCallback?(coachID: string, code: string, state: string): Promise<Integration>;
  refreshToken?(integration: Integration): Promise<string>;
  fetchScheduledEvents?(accessToken: string, userUri: string, startDate?: string, endDate?: string): Promise<any[]>;
}
