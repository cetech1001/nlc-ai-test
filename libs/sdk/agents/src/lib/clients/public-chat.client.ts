import {BaseClient, ServiceClientConfig} from '@nlc-ai/sdk-core';

export interface ChatbotInfoResponse {
  success: boolean;
  coachName: string;
  assistantName: string;
  available: boolean;
}

export interface ThreadResponse {
  threadID: string;
}

export interface ThreadMessagesResponse {
  id: string;
  threadID: string;
  coachID: string;
  role: 'user' | 'assistant';
  content: string;
  messageID?: string;
  runID?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export class PublicChatClient extends BaseClient {
  private readonly config: ServiceClientConfig;

  constructor(config: ServiceClientConfig) {
    super(config);
    this.config = config;
  }

  /**
   * Get public chatbot info for a coach
   */
  async getChatbotInfo(): Promise<ChatbotInfoResponse> {
    const response = await this.request<ChatbotInfoResponse>(
      'GET',
      `/info`
    );
    return response.data!;
  }

  /**
   * Create new conversation thread
   */
  async createThread(): Promise<ThreadResponse> {
    const response = await this.request<ThreadResponse>(
      'POST',
      `/thread/create`
    );
    return response.data!;
  }

  /**
   * Get all messages in thread
   */
  async getThreadMessages(threadID: string) {
    const response = await this.request<ThreadMessagesResponse[]>(
      'GET',
      `/thread/${threadID}/messages`
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
    const info = await this.getChatbotInfo();
    const thread = await this.createThread();

    return {
      coachName: info.coachName,
      threadID: thread.threadID,
      greetingMessage: `Hi! I'm ${info.coachName}'s AI assistant. How can I help you today?`
    };
  }

  /**
   * Stream assistant response with real-time updates
   */
  async streamMessage(
    threadID: string,
    message: string,
    onContent: (content: string) => void,
    onDone?: (fullContent: string) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    const url = `${this.config.baseURL}/thread/${threadID}/stream`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content') {
                onContent(parsed.content);
              } else if (parsed.type === 'done') {
                if (onDone) {
                  onDone(parsed.fullContent);
                }
              }
            } catch (e) {
            }
          }
        }
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        throw error;
      }
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }
}
