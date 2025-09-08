import {EmailAccountStatus, EmailProvider, EmailSyncDirection, SyncStatus} from "./enums";
import {UserType} from "../../users";

export interface EmailAccount {
  id: string;
  userID: string;
  userType: UserType;
  emailAddress: string;
  provider: EmailProvider;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  isPrimary: boolean;
  isActive: boolean;
  syncEnabled: boolean;
  lastSyncAt?: string;
  status: EmailAccountStatus;
  syncSettings: EmailSyncSettings;
  createdAt: string;
  updatedAt: string;
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
