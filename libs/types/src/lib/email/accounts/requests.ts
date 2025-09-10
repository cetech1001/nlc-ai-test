import { QueryParams } from '../../query-params';
import {
  EmailAccountProvider,
  EmailAccountStatus,
  TestEmailConnectionType,
} from './enums';
import { EmailSyncSettings } from './common';
import {UserType} from "../../users";

export interface CreateEmailAccountRequest {
  emailAddress: string;
  provider: EmailAccountProvider;
  accessToken?: string;
  refreshToken?: string;
  isPrimary?: boolean;
  syncSettings?: Partial<EmailSyncSettings>;
}

export interface UpdateEmailAccountRequest {
  isPrimary?: boolean;
  isActive?: boolean;
  syncEnabled?: boolean;
  syncSettings?: Partial<EmailSyncSettings>;
}

export interface GetEmailAccountsRequest extends QueryParams {
  userID?: string;
  userType?: UserType;
  provider?: EmailAccountProvider;
  status?: EmailAccountStatus;
  isActive?: boolean;
  isPrimary?: boolean;
}

export interface AuthorizeEmailAccountRequest {
  provider: EmailAccountProvider;
  authCode: string;
  redirectURI?: string;
  state?: string;
}

export interface RefreshEmailTokenRequest {
  accountID: string;
  forceRefresh?: boolean;
}

export interface SyncEmailAccountRequest {
  accountID: string;
  forceFull?: boolean;
  maxEmails?: number;
}

export interface BulkSyncRequest {
  accountIDs?: string[];
  userID?: string;
  userType?: UserType;
  forceFull?: boolean;
}

export interface TestEmailConnectionRequest {
  accountID: string;
  testType: TestEmailConnectionType;
}

export interface UpdateSyncSettingsRequest {
  accountID: string;
  syncSettings: EmailSyncSettings;
}
