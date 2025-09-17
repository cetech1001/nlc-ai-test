import { BaseClient } from "@nlc-ai/sdk-core";
import {ClientEmailThread, EmailThreadDetail} from "@nlc-ai/sdk-integrations";

export class ThreadsClient extends BaseClient {
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
      `?${searchParams.toString()}`
    );
    return response.data!;
  }

  async getEmailThread(threadID: string): Promise<EmailThreadDetail> {
    const response = await this.request<EmailThreadDetail>(
      'GET',
      `/${threadID}`
    );
    return response.data!;
  }

  async markThreadRead(threadID: string, isRead: boolean): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      'POST',
      `/${threadID}/mark-read`,
      { body: { isRead } }
    );
    return response.data!;
  }
}
