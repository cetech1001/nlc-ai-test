import { BaseClient } from '@nlc-ai/sdk-core';
import {
  ClientEmailResponse,
} from '../types';

export class ClientEmailClient extends BaseClient {
  /**
   * Generate AI response for email thread
   */
  async generateResponse(threadID: string, customInstructions?: string): Promise<ClientEmailResponse> {
    const response = await this.request<ClientEmailResponse>(
      'POST',
      `/generate/${threadID}`,
      { body: { customInstructions } }
    );
    return response.data!;
  }

  /**
   * Regenerate existing response
   */
  async regenerateResponse(responseID: string, customInstructions?: string): Promise<ClientEmailResponse> {
    const response = await this.request<ClientEmailResponse>(
      'POST',
      `/regenerate/${responseID}`,
      { body: { customInstructions } }
    );
    return response.data!;
  }

  /**
   * Get generated responses for a thread
   */
  async getResponsesForThread(threadID: string): Promise<ClientEmailResponse[]> {
    const response = await this.request<ClientEmailResponse[]>(
      'GET',
      `/responses/${threadID}`
    );
    return response.data!;
  }

  /**
   * Get all generated responses for coach
   */
  async getAllResponses(): Promise<ClientEmailResponse[]> {
    const response = await this.request<ClientEmailResponse[]>(
      'GET',
      `/responses`
    );
    return response.data!;
  }

  /**
   * Update response before sending
   */
  async updateResponse(responseID: string, updates: { subject?: string; body?: string }): Promise<ClientEmailResponse> {
    const response = await this.request<ClientEmailResponse>(
      'POST',
      `/responses/${responseID}/update`,
      { body: updates }
    );
    return response.data!;
  }

  /**
   * Send generated response immediately
   */
  async sendResponse(responseID: string, modifications?: { subject?: string; body?: string }): Promise<{ success: boolean; message: string; messageID?: string; sentAt?: Date }> {
    const response = await this.request<{ success: boolean; message: string; messageID?: string; sentAt?: Date }>(
      'POST',
      `/send/${responseID}`,
      { body: modifications }
    );
    return response.data!;
  }

  /**
   * Schedule response for later
   */
  async scheduleResponse(responseID: string, scheduledFor: string, modifications?: { subject?: string; body?: string }): Promise<{ success: boolean; message: string; scheduledEmailID?: string; scheduledFor?: Date }> {
    const response = await this.request<{ success: boolean; message: string; scheduledEmailID?: string; scheduledFor?: Date }>(
      'POST',
      `/schedule/${responseID}`,
      { body: { scheduledFor, ...modifications } }
    );
    return response.data!;
  }

  /**
   * Send custom email to client
   */
  async sendCustomEmail(data: {
    clientID: string;
    threadID?: string;
    subject: string;
    body: string;
    scheduledFor?: string;
  }): Promise<{ success: boolean; message: string; messageID?: string; scheduledEmailID?: string }> {
    const response = await this.request<{ success: boolean; message: string; messageID?: string; scheduledEmailID?: string }>(
      'POST',
      `/send-custom`,
      { body: data }
    );
    return response.data!;
  }

  /**
   * Cancel scheduled email
   */
  async cancelScheduledEmail(scheduledEmailID: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(
      'POST',
      `/cancel-scheduled/${scheduledEmailID}`
    );
    return response.data!;
  }
}
