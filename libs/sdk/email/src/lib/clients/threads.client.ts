import {BaseClient} from "@nlc-ai/sdk-core";
import {
  ClientEmailThread,
  EmailThreadDetail,
  GeneratedEmailResponse,
  GetThreadsParams,
  ReplyToThreadParams,
  UpdateThreadParams
} from "../types";

export class ThreadsClient extends BaseClient {
  /**
   * Get email threads with optional filters
   */
  async getEmailThreads(params?: GetThreadsParams): Promise<ClientEmailThread[]> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.clientID) searchParams.append('clientID', params.clientID);
    if (params?.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const response = await this.request<ClientEmailThread[]>(
      'GET',
      queryString ? `?${queryString}` : ''
    );
    return response.data!;
  }

  /**
   * Get a specific thread with full details
   */
  async getEmailThread(threadID: string): Promise<EmailThreadDetail> {
    const response = await this.request<EmailThreadDetail>(
      'GET',
      `/${threadID}`
    );
    return response.data!;
  }

  /**
   * Get generated AI responses for a thread
   */
  async getThreadResponses(threadID: string): Promise<GeneratedEmailResponse[]> {
    const response = await this.request<GeneratedEmailResponse[]>(
      'GET',
      `/${threadID}/responses`
    );
    return response.data!;
  }

  /**
   * Mark a thread as read or unread
   */
  async markThreadRead(threadID: string, isRead: boolean): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      'PATCH',
      `/${threadID}`,
      { body: { isRead } }
    );
    return response.data!;
  }

  /**
   * Reply to a thread
   */
  async replyToThread(
    threadID: string,
    replyData: ReplyToThreadParams
  ): Promise<{ success: boolean; error?: { message: string } }> {
    return await this.request<{ success: boolean; error?: { message: string } }>(
      'POST',
      `/${threadID}/reply`,
      {body: replyData}
    );
  }

  /**
   * Update thread properties
   */
  async updateThread(
    threadID: string,
    updates: UpdateThreadParams
  ): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      'PATCH',
      `/${threadID}`,
      { body: updates }
    );
    return response.data!;
  }
}
