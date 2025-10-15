import { BaseClient } from '@nlc-ai/sdk-core';

export interface EmailAgentInfo {
  hasEmailAgent: boolean;
  hasFineTunedModel: boolean;
  modelID?: string;
  lastFineTuningAt?: Date;
  fineTuningEmailCount?: number;
  baseModel?: string;
  assistantID?: string;
  totalRequests?: number;
  lastUsedAt?: Date;
  message?: string;
}

export interface SaveResponseParams {
  threadID: string;
  subject: string;
  body: string;
  confidence?: number;
}

export interface UpdateResponseParams {
  actualSubject: string;
  actualBody: string;
}

export interface StreamChunk {
  type: 'content' | 'done' | 'error';
  content?: string;
  subject?: string;
  body?: string;
  fullContent?: string;
  responseID?: string;
  error?: string;
}

export class ClientEmailClient extends BaseClient {
  /**
   * Stream AI-generated email response
   * Returns an async generator that yields chunks as they arrive
   */
  async *streamEmailResponse(
    threadID: string,
    messageContext?: string
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const url = `${this.baseURL}/stream-response`;

    const token = this.getToken?.() || this.apiKey;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        threadID,
        messageContext,
        saveResponse: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stream request failed: ${response.statusText} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          // SSE format: "data: {...}"
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (jsonStr) {
                const chunk = JSON.parse(jsonStr) as StreamChunk;

                if (chunk.type === 'error') {
                  throw new Error(chunk.error || 'Stream error occurred');
                }

                yield chunk;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE chunk:', line, parseError);
              // Continue processing other chunks
            }
          }
        }
      }

      // Process any remaining data in buffer
      if (buffer.trim() && buffer.startsWith('data: ')) {
        try {
          const jsonStr = buffer.slice(6).trim();
          if (jsonStr) {
            const chunk = JSON.parse(jsonStr) as StreamChunk;
            if (chunk.type === 'error') {
              throw new Error(chunk.error || 'Stream error occurred');
            }
            yield chunk;
          }
        } catch (parseError) {
          console.error('Failed to parse final SSE chunk:', buffer, parseError);
        }
      }
    } catch (error) {
      reader.cancel();
      throw error;
    }
  }

  /**
   * Save a generated response for tracking
   */
  async saveGeneratedResponse(params: SaveResponseParams): Promise<{ message: string; responseID: string }> {
    const response = await this.request<{ message: string; responseID: string }>(
      'POST',
      `/response/save`,
      { body: params }
    );
    return response.data!;
  }

  /**
   * Update a generated response with what was actually sent
   */
  async updateGeneratedResponse(
    responseID: string,
    params: UpdateResponseParams
  ): Promise<{ message: string; responseID: string }> {
    const response = await this.request<{ message: string; responseID: string }>(
      'POST',
      `/response/${responseID}/update`,
      { body: params }
    );
    return response.data!;
  }

  /**
   * Get email agent information and capabilities
   */
  async getAgentInfo(): Promise<EmailAgentInfo> {
    const response = await this.request<EmailAgentInfo>(
      'GET',
      '/info'
    );
    return response.data!;
  }
}
