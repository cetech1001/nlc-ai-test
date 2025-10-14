import { BaseClient } from "@nlc-ai/sdk-core";
import {EmailSyncStats} from "../types";

export interface SyncAccountParams {
  accountID: string;
  forceFull?: boolean;
}

export interface BulkSyncParams {
  accountIDs: string[];
  forceFull?: boolean;
}

export interface SyncResult {
  success: boolean;
  message: string;
  syncedCount?: number;
  errors?: string[];
}

export class SyncClient extends BaseClient {
  /**
   * Sync a specific email account
   */
  async syncAccount(params: SyncAccountParams): Promise<SyncResult> {
    const response = await this.request<SyncResult>(
      'POST',
      '/account',
      { body: params }
    );
    return response.data!;
  }

  /**
   * Sync all email accounts for the authenticated coach
   */
  async syncAllAccounts(): Promise<SyncResult> {
    const response = await this.request<SyncResult>(
      'POST',
      '/all'
    );
    return response.data!;
  }

  /**
   * Bulk sync multiple accounts
   */
  async bulkSync(params: BulkSyncParams): Promise<SyncResult> {
    const response = await this.request<SyncResult>(
      'POST',
      '/bulk',
      { body: params }
    );
    return response.data!;
  }

  /**
   * Get email sync statistics
   */
  async getSyncStats() {
    const response = await this.request<EmailSyncStats>(
      'GET',
      '/stats'
    );
    return response.data!;
  }

  /**
   * Sync specific account by ID
   */
  async syncAccountByID(accountID: string, forceFull: boolean = false): Promise<SyncResult> {
    const response = await this.request<SyncResult>(
      'POST',
      `/account/${accountID}`,
      { body: { forceFull } }
    );
    return response.data!;
  }
}
