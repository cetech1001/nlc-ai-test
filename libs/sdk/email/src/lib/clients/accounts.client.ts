import { BaseClient } from "@nlc-ai/sdk-core";
import { EmailAccount } from "@nlc-ai/types";

export class AccountsClient extends BaseClient {
  /**
   * Get all email accounts for the authenticated coach
   */
  async getEmailAccounts(): Promise<EmailAccount[]> {
    const response = await this.request<EmailAccount[]>('GET', '');
    return response.data!;
  }

  /**
   * Check if the authenticated coach has any email accounts
   */
  async hasAnAccount(): Promise<{ exists: boolean }> {
    const response = await this.request<{ exists: boolean }>('GET', '/exists');
    return response.data!;
  }

  /**
   * Set an email account as primary
   */
  async setPrimaryEmailAccount(accountID: string): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      'POST',
      `/${accountID}/set-primary`
    );
    return response.data!;
  }

  /**
   * Get account connection status
   */
  async getAccountStatus(accountID: string): Promise<{
    accountID: string;
    isConnected: boolean;
    lastSyncAt?: Date;
    error?: string;
  }> {
    const response = await this.request<{
      accountID: string;
      isConnected: boolean;
      lastSyncAt?: Date;
      error?: string;
    }>('GET', `/${accountID}/status`);
    return response.data!;
  }
}
