import {AuthType, IntegrationType} from "./enums";
import {UserType} from "../users";

export interface Integration {
  id: string;
  userID: string;
  userType: string;
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
  userID: string;
  userType: UserType;
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

  connect(userID: string, userType: string, credentials: any): Promise<Integration>;
  test(integration: Integration): Promise<TestResult>;
  sync(integration: Integration): Promise<SyncResult>;
  disconnect(integration: Integration): Promise<void>;

  getAuthUrl?(userID: string, userType: string): Promise<{ authUrl: string; state: string }>;
  handleCallback?(userID: string, userType: string, code: string, state: string): Promise<Integration>;
  refreshToken?(integration: Integration): Promise<string>;
  fetchScheduledEvents?(accessToken: string, userUri: string, startDate?: string, endDate?: string): Promise<any[]>;
}
