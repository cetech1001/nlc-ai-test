import { BaseClient } from "@nlc-ai/sdk-core";
import {EmailAccount} from "@nlc-ai/types";
import {ClientEmailSyncResult} from "@nlc-ai/sdk-integrations";

export class AccountsClient extends BaseClient {
  async getEmailAccounts() {
    const response = await this.request<EmailAccount[]>('GET', '');
    return response.data;
  }

  async hasAnAccount() {
    const response = await this.request<{ exists: boolean }>('GET', '/exists');
    return response.data!;
  }

  async getSyncStats() {
    const response = await this.request<{
      unreadThreads: number;
      totalThreadsToday: number;
      lastSyncAt: Date | null;
    }>('GET', '/stats');
    return response.data!;
  }

  async syncClientEmails() {
    const response = await this.request<ClientEmailSyncResult>('POST', '/sync/all');
    return response.data!;
  }
}
