import {BaseClient} from "@nlc-ai/sdk-core";
import {ClientEmailSyncResult, ClientEmailThread, EmailThreadDetail} from "../types";

export class EmailSyncClient extends BaseClient{
  /**
   * Mark thread as read/unread
   */
  async markThreadRead(threadID: string, isRead: boolean): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      'POST',
      `/threads/${threadID}/mark-read`,
      { body: { isRead } }
    );
    return response.data!;
  }

  /**
   * Manually sync client emails
   */
  async syncClientEmails(): Promise<ClientEmailSyncResult> {
    const response = await this.request<ClientEmailSyncResult>('POST', '/sync');
    return response.data!;
  }

  /**
   * Get email sync statistics
   */
  async getSyncStats(): Promise<{
    unreadThreads: number;
    totalThreadsToday: number;
    lastSyncAt: Date | null;
  }> {
    const response = await this.request<{
      unreadThreads: number;
      totalThreadsToday: number;
      lastSyncAt: Date | null;
    }>('GET', '/stats');
    return response.data!;
  }

  /**
   * Get all email threads for the coach
   */
  async getEmailThreads(params?: {
    limit?: number;
    status?: string;
    clientID?: string;
    isRead?: boolean;
    priority?: string;
    search?: string;
  }): Promise<ClientEmailThread[]> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.clientID) searchParams.append('clientID', params.clientID);
    if (params?.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.search) searchParams.append('search', params.search);

    const response = await this.request<ClientEmailThread[]>(
      'GET',
      `/threads?${searchParams.toString()}`
    );
    return response.data!;
  }

  /**
   * Get detailed email thread with messages
   */
  async getEmailThread(threadID: string): Promise<EmailThreadDetail> {
    const response = await this.request<EmailThreadDetail>(
      'GET',
      `/threads/${threadID}`
    );
    return response.data!;
  }
}
