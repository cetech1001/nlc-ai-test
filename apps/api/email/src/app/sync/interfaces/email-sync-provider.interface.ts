import { EmailSyncSettings } from '@nlc-ai/types';

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

export interface SyncProgress {
  accountID: string;
  totalToSync: number;
  synced: number;
  failed: number;
  currentBatch: number;
  estimatedTimeRemaining?: number;
}

export interface IEmailSyncProvider {
  authenticate(authCode: string, redirectURI: string): Promise<{
    accessToken: string;
    refreshToken?: string | null;
    expiresAt?: string;
  }>;

  refreshToken(refreshToken: string): Promise<{
    accessToken: string;
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
