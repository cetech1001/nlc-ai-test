import { BaseClient, Paginated } from '@nlc-ai/sdk-core';
import {ActionResponse, NotificationFilters, NotificationResponse, UnreadCountResponse} from "./notifications.types";

export class NotificationsServiceClient extends BaseClient {

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

  async deleteNotification(notificationID: string): Promise<ActionResponse> {
    const response = await this.request<ActionResponse>('DELETE', `/notifications/${notificationID}`);
    return response.data!;
  }
}
