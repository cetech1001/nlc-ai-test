/// <reference lib="dom"/>

import { BaseClient, Paginated } from '@nlc-ai/sdk-core';
import {
  NotificationResponse,
  NotificationFilters,
  NotificationPreferences,
  UpdatePreferencesRequest,
  UnreadCountResponse,
  ActionResponse,
  CreateNotificationRequest,
} from './notifications.types.js';

// Socket.IO client interface (to avoid dependency issues)
interface SocketIOClient {
  on(event: string, callback: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  disconnect(): void;
  connected: boolean;
}

export class NotificationsServiceClient extends BaseClient {
  private socket: SocketIOClient | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

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

  // Socket.IO WebSocket connection
  connectWebSocket(onNotification: (notification: NotificationResponse) => void): () => void {
    try {
      // Dynamically import Socket.IO client if available
      if (typeof window !== 'undefined' && (window as any).io) {
        const io = (window as any).io;

        const socketUrl = this.baseURL.replace('/api/notifications', '');
        this.socket = io(`${socketUrl}/notifications`, {
          path: '/api/notifications/socket.io',
          auth: {
            token: this.getAuthToken(),
            userID: this.getCurrentUserID(),
            userType: this.getCurrentUserType(),
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: this.maxReconnectAttempts,
        });

        // Connection events
        this.socket?.on('connect', () => {
          console.log('Connected to notifications WebSocket');
          this.reconnectAttempts = 0;

          // Subscribe to notifications
          this.socket?.emit('subscribe-notifications');
        });

        this.socket?.on('disconnect', () => {
          console.log('Disconnected from notifications WebSocket');
        });

        this.socket?.on('connect_error', (error: any) => {
          console.warn('WebSocket connection error:', error);
          this.reconnectAttempts++;

          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('Max reconnection attempts reached, giving up');
          }
        });

        // Notification events
        this.socket?.on('notification', (notification: NotificationResponse) => {
          onNotification(notification);
        });

        this.socket?.on('broadcast-notification', (notification: any) => {
          onNotification(notification);
        });

        this.socket?.on('subscribed', (data: any) => {
          console.log('Subscribed to notifications:', data.message);
        });

        // Return cleanup function
        return () => {
          if (this.socket) {
            this.socket?.disconnect();
            this.socket = null;
          }
        };
      } else {
        console.warn('Socket.IO client not available - add <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script> to your HTML');
        return () => {};
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      return () => {};
    }
  }

  private getAuthToken(): string {
    // Implementation depends on your auth system
    // This is a placeholder - you'll need to implement based on your auth store
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
    }
    return '';
  }

  private getCurrentUserID(): string {
    // Implementation depends on your auth system
    // This is a placeholder - you'll need to implement based on your auth store
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (user) {
        try {
          return JSON.parse(user).id || '';
        } catch {
          return '';
        }
      }
    }
    return '';
  }

  private getCurrentUserType(): string {
    // Implementation depends on your auth system
    // This is a placeholder - you'll need to implement based on your auth store
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (user) {
        try {
          return JSON.parse(user).type || '';
        } catch {
          return '';
        }
      }
    }
    return '';
  }

  // Check if WebSocket is connected
  isWebSocketConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get WebSocket connection status
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' | 'not_initialized' {
    if (!this.socket) return 'not_initialized';
    if (this.socket.connected) return 'connected';
    return 'disconnected';
  }
}
