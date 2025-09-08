import {
  EmailAccount,
  EmailSyncResult,
  EmailAccountHealth
} from './common';

export interface CreateEmailAccountResponse {
  account: EmailAccount;
  authURL?: string;
  success: boolean;
  message: string;
}

export interface GetEmailAccountResponse {
  account: EmailAccount;
  health: EmailAccountHealth;
  recentSyncResults: EmailSyncResult[];
}

export interface GetEmailAccountsResponse {
  accounts: EmailAccount[];
  total: number;
  hasMore: boolean;
  healthSummary: {
    healthy: number;
    unhealthy: number;
    inactive: number;
  };
}

export interface UpdateEmailAccountResponse {
  account: EmailAccount;
  success: boolean;
  message: string;
}

export interface AuthorizeEmailAccountResponse {
  account: EmailAccount;
  authURL?: string;
  success: boolean;
  message: string;
}

export interface RefreshEmailTokenResponse {
  account: EmailAccount;
  tokenRefreshed: boolean;
  expiresAt?: string;
  success: boolean;
  message: string;
}

export interface SyncEmailAccountResponse {
  syncResult: EmailSyncResult;
  account: EmailAccount;
  success: boolean;
  message: string;
}

export interface BulkSyncResponse {
  results: EmailSyncResult[];
  totalAccounts: number;
  successfulSyncs: number;
  failedSyncs: number;
  success: boolean;
  message: string;
}

export interface TestEmailConnectionResponse {
  testResults: {
    auth: {
      success: boolean;
      error?: string;
    };
    send?: {
      success: boolean;
      error?: string;
    };
    receive?: {
      success: boolean;
      error?: string;
    };
  };
  overallHealth: boolean;
  recommendations: string[];
  success: boolean;
  message: string;
}

export interface DeleteEmailAccountResponse {
  success: boolean;
  message: string;
  affectedThreads: number;
  dataRetained: boolean;
}

export interface GetAccountHealthResponse {
  health: EmailAccountHealth;
  trends: Array<{
    date: string;
    syncSuccess: boolean;
    emailsProcessed: number;
    errorCount: number;
  }>;
}

export interface UpdateSyncSettingsResponse {
  account: EmailAccount;
  settingsApplied: boolean;
  nextSyncAt?: string;
  success: boolean;
  message: string;
}
