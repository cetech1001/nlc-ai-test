import { BaseClient, Paginated } from '@nlc-ai/sdk-core';
import {
  ConversationResponse,
  DirectMessageResponse,
  CreateConversationRequest,
  CreateMessageRequest,
  UpdateMessageRequest,
  MessageFilters,
  ConversationFilters,
  MarkAsReadRequest,
  UnreadCountResponse,
} from '../types';

export class MessagingClient extends BaseClient {
  async createConversation(data: CreateConversationRequest): Promise<ConversationResponse> {
    const response = await this.request<ConversationResponse>('POST', '/conversations', { body: data });
    return response.data!;
  }

  async getConversations(filters?: ConversationFilters): Promise<Paginated<ConversationResponse>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<ConversationResponse>>(
      'GET',
      `/conversations?${searchParams}`
    );
    return response.data!;
  }

  async getConversation(id: string): Promise<ConversationResponse> {
    const response = await this.request<ConversationResponse>('GET', `/conversations/${id}`);
    return response.data!;
  }

  // Messages
  async sendMessage(conversationID: string, data: CreateMessageRequest): Promise<DirectMessageResponse> {
    const response = await this.request<DirectMessageResponse>(
      'POST',
      `/conversations/${conversationID}/messages`,
      { body: data }
    );
    return response.data!;
  }

  async getMessages(conversationID: string, filters?: MessageFilters): Promise<Paginated<DirectMessageResponse>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<DirectMessageResponse>>(
      'GET',
      `/conversations/${conversationID}/messages?${searchParams}`
    );
    return response.data!;
  }

  async editMessage(messageID: string, data: UpdateMessageRequest): Promise<DirectMessageResponse> {
    const response = await this.request<DirectMessageResponse>('PUT', `/messages/${messageID}`, { body: data });
    return response.data!;
  }

  async deleteMessage(messageID: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('DELETE', `/messages/${messageID}`);
    return response.data!;
  }

  async markAsRead(data: MarkAsReadRequest): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('POST', '/messages/mark-read', { body: data });
    return response.data!;
  }

  async getUnreadCount(conversationID: string): Promise<UnreadCountResponse> {
    const response = await this.request<UnreadCountResponse>('GET', `/conversations/${conversationID}/unread-count`);
    return response.data!;
  }

  // Support conversation (for coaches to contact admin)
  async createSupportConversation(): Promise<ConversationResponse> {
    const response = await this.request<ConversationResponse>('POST', '/support/conversation');
    return response.data!;
  }
}
