import { BaseClient } from '@nlc-ai/sdk-core';

export interface ChatbotInfoResponse {
  success: boolean;
  coachName: string;
  assistantName: string;
  available: boolean;
}

export interface ThreadResponse {
  success: boolean;
  threadID: string;
}

export interface MessageResponse {
  success: boolean;
  messageID: string;
}

export interface RunResponse {
  success: boolean;
  runID: string;
  status: string;
}

export interface RunStatusResponse {
  success: boolean;
  status: string;
  completedAt?: number;
  failedAt?: number;
  lastError?: any;
}

export interface ThreadMessagesResponse {
  success: boolean;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: Array<{
      type: string;
      text: {
        value: string;
      };
    }>;
    created_at: number;
  }>;
}

export class PublicChatClient extends BaseClient {
  private coachID: string;

  constructor(config: any, coachID: string) {
    super(config);
    this.coachID = coachID;
  }

  /**
   * Get public chatbot info for a coach
   */
  async getChatbotInfo(): Promise<ChatbotInfoResponse> {
    const response = await this.request<ChatbotInfoResponse>(
      'GET',
      `/coach/${this.coachID}/info`
    );
    return response.data!;
  }

  /**
   * Create new conversation thread
   */
  async createThread(): Promise<ThreadResponse> {
    const response = await this.request<ThreadResponse>(
      'POST',
      `/coach/${this.coachID}/thread/create`
    );
    return response.data!;
  }

  /**
   * Add message to thread
   */
  async addMessageToThread(threadID: string, message: string): Promise<MessageResponse> {
    const response = await this.request<MessageResponse>(
      'POST',
      `/coach/${this.coachID}/thread/${threadID}/message`,
      { body: { message } }
    );
    return response.data!;
  }

  /**
   * Run assistant on thread
   */
  async runAssistant(threadID: string): Promise<RunResponse> {
    const response = await this.request<RunResponse>(
      'POST',
      `/coach/${this.coachID}/thread/${threadID}/run`
    );
    return response.data!;
  }

  /**
   * Get run status
   */
  async getRunStatus(threadID: string, runID: string): Promise<RunStatusResponse> {
    const response = await this.request<RunStatusResponse>(
      'GET',
      `/coach/${this.coachID}/thread/${threadID}/run/${runID}/status`
    );
    return response.data!;
  }

  /**
   * Get all messages in thread
   */
  async getThreadMessages(threadID: string): Promise<ThreadMessagesResponse> {
    const response = await this.request<ThreadMessagesResponse>(
      'GET',
      `/coach/${this.coachID}/thread/${threadID}/messages`
    );
    return response.data!;
  }

  /**
   * Initialize chat session with greeting
   */
  async initializeChat(): Promise<{
    coachName: string;
    threadID: string;
    greetingMessage: string;
  }> {
    // Get coach info
    const info = await this.getChatbotInfo();

    // Create thread
    const thread = await this.createThread();

    return {
      coachName: info.coachName,
      threadID: thread.threadID,
      greetingMessage: `Hi! I'm ${info.coachName}'s AI assistant. How can I help you today?`
    };
  }

  /**
   * Complete workflow: Send message and wait for response
   */
  async sendMessageAndWaitForResponse(
    threadID: string,
    message: string,
    maxAttempts: number = 30,
    pollInterval: number = 1000
  ): Promise<string> {
    await this.addMessageToThread(threadID, message);

    const runResponse = await this.runAssistant(threadID);

    let attempts = 0;

    while (attempts < maxAttempts) {
      const statusResponse = await this.getRunStatus(threadID, runResponse.runID);

      if (statusResponse.status === 'completed') {
        const messagesResponse = await this.getThreadMessages(threadID);

        const latestMessage = messagesResponse.messages[0];
        return latestMessage.content[0].text.value;
      }

      if (statusResponse.status === 'failed' || statusResponse.status === 'cancelled') {
        throw new Error(`Run ${statusResponse.status}: ${statusResponse.lastError?.message || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    throw new Error('Request timed out');
  }
}
