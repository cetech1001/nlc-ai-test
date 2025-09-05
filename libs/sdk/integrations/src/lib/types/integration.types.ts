export enum IntegrationType {
  SOCIAL = 'social',
  APP = 'app',
  COURSE = 'course',
}

export enum AuthType {
  OAUTH = 'oauth',
  API_KEY = 'api_key',
  WEBHOOK = 'webhook',
}

export enum SocialPlatform {
  YOUTUBE = 'youtube',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  TWITTER = 'twitter',
  TIKTOK = 'tiktok',
  LINKEDIN = 'linkedin',
}

export enum AppPlatform {
  CALENDLY = 'calendly',
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
}

export enum EmailProviderTypes {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  SYNCING = 'syncing',
}

export enum SyncFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MANUAL = 'manual',
}

// Core interfaces
export interface Integration {
  id: string;
  userID: string;
  userType: string; // 'coach', 'admin', 'client'
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
  userID: string;
  userType: string; // 'coach', 'admin', 'client'
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

// Request/Response interfaces
export interface ConnectPlatformRequest {
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

export interface ToggleEmailSyncRequest {
  syncEnabled: boolean;
}

export interface EmailAccountStatsQuery {
  days?: string;
}

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

export interface TestResponse {
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

export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}

export interface IntegrationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  integrationType?: IntegrationType;
  platformName?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdAfter?: string;
  createdBefore?: string;
}
