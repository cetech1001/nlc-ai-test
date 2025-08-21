/// <reference lib="dom"/>

import { BaseServiceClient, Paginated } from '@nlc-ai/sdk-core';
import {
  NotificationResponse,
  NotificationFilters,
  NotificationPreferences,
  UpdatePreferencesRequest,
  UnreadCountResponse,
  ActionResponse,
  CreateNotificationRequest,
} from './notifications.types.js';

export class NotificationsServiceClient extends BaseServiceClient {
  // Notification methods
  async getNotifications(filters?: NotificationFilters): Promise<Paginated<NotificationResponse>> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.request<Paginated<NotificationResponse>>(
      'GET',
      `/notifications?${searchParams}`
    );
    return response.data!;
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await this.request<UnreadCountResponse>('GET', '/notifications/unread-count');
    return response.data!;
  }

  async markAsRead(notificationID: string): Promise<ActionResponse> {
    const response = await this.request<ActionResponse>('PUT', `/notifications/${notificationID}/read`);
    return response.data!;
  }

  async markAllAsRead(): Promise<ActionResponse & { updatedCount: number }> {
    const response = await this.request<ActionResponse & { updatedCount: number }>('PUT', '/notifications/mark-all-read');
    return response.data!;
  }

  async createNotification(data: CreateNotificationRequest): Promise<NotificationResponse> {
    const response = await this.request<{ message: string; notification: NotificationResponse }>('POST', '/notifications', { body: data });
    return response.data!.notification;
  }

  // Preference methods
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await this.request<{ preferences: NotificationPreferences }>('GET', '/preferences');
    return response.data!.preferences;
  }

  async updatePreferences(preferences: UpdatePreferencesRequest): Promise<NotificationPreferences> {
    const response = await this.request<{ message: string; preferences: NotificationPreferences }>('PUT', '/preferences', { body: preferences });
    return response.data!.preferences;
  }

  // WebSocket connection for real-time notifications
  connectWebSocket(onNotification: (notification: NotificationResponse) => void): () => void {
    // This would connect to a WebSocket endpoint for real-time notifications
    // Implementation depends on your WebSocket setup
    const ws = new WebSocket(`${this.baseURL.replace('http', 'ws')}/notifications/ws`);

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        onNotification(notification);
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Return cleanup function
    return () => {
      ws.close();
    };
  }
}
