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

export class ClientEmailClient extends BaseClient {
  /**
   * Stream AI-generated email response
   * Returns an EventSource-compatible stream
   */
  async streamEmailResponse(
    threadID: string,
    messageContext?: string
  ): Promise<ReadableStream> {
    const url = `${this.baseURL}/stream-response`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        threadID,
        messageContext,
      }),
    });

    if (!response.ok) {
      throw new Error(`Stream request failed: ${response.statusText}`);
    }

    const text = await response.text();

    if (text.includes('event: error')) {
      throw new Error(text.split('data: ').pop());
    }

    return response.body!;
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
