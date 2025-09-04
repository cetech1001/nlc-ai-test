import { BaseClient, Paginated } from '@nlc-ai/sdk-core';

export interface NotificationResponse {
  id: string;
  userID: string;
  userType: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  priority: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface ActionResponse {
  message: string;
  updatedCount?: number;
}

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
