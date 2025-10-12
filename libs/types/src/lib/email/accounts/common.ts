import {EmailAccountProvider, EmailSyncDirection, SyncStatus} from "./enums";
import {UserType} from "../../users";

export interface EmailAccount {
  id: string;
  userID: string;
  userType: UserType;
  emailAddress: string;
  provider: EmailAccountProvider;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  isPrimary: boolean;
  isActive: boolean;
  syncEnabled: boolean;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailSyncSettings {
  syncInterval: number;
  maxEmailsPerSync: number;
  syncDirection: EmailSyncDirection;
  filterSettings: {
    fromDomain?: string[];
    excludeSpam: boolean;
    excludePromotional: boolean;
    keywords?: string[];
    dateRange?: {
      start?: string;
      end?: string;
    };
  };
  folderSettings: {
    inbox: boolean;
    sent: boolean;
    drafts: boolean;
    archive: boolean;
    customFolders?: string[];
  };
}

export interface SyncedEmail {
  providerMessageID: string;
  threadID: string;
  to: string;
  from: string;
  subject?: string;
  text?: string;
  html?: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    url?: string;
  }>;
  sentAt: string;
  receivedAt?: string;
  isRead: boolean;
  labels?: string[];
  folder?: string;
}

export interface IEmailSyncProvider {
  authenticate(authCode: string, redirectURI: string): Promise<{
    accessToken: string;
    refreshToken?: string | null;
    expiresAt?: string;
  }>;

  refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string | null;
    expiresAt?: string;
  }>;

  syncEmails(
    accessToken: string,
    settings: EmailSyncSettings,
    lastSyncToken?: string
  ): Promise<{
    emails: SyncedEmail[];
    nextSyncToken?: string | null;
    hasMore: boolean;
  }>;

  testConnection(accessToken: string): Promise<boolean>;

  getUserInfo(accessToken: string): Promise<{
    email: string;
    name: string;
  }>;
}

export interface EmailSyncResult {
  accountID: string;
  syncStartTime: string;
  syncEndTime: string;
  status: SyncStatus;
  emailsProcessed: number;
  newEmails: number;
  updatedEmails: number;
  errorCount: number;
  errors: string[];
  nextSyncAt?: string;
}

export interface EmailAccountHealth {
  accountID: string;
  isHealthy: boolean;
  lastSuccessfulSync?: string;
  consecutiveFailures: number;
  quotaUsage?: {
    used: number;
    limit: number;
    resetTime?: string;
  };
  issues: string[];
  recommendations: string[];
}
