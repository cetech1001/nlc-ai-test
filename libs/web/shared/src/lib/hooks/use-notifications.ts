import { useState, useEffect, useCallback, useRef } from 'react';
import { NLCClient } from "@nlc-ai/sdk-main";

interface Notification {
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

interface UseNotificationsOptions {
  autoFetch?: boolean;
  pollIntervalMs?: number;
}

export const useNotifications = (
  sdkClient: NLCClient,
  options: UseNotificationsOptions = {}
) => {
  const {
    autoFetch = true,
    pollIntervalMs = 30000, // 30 seconds
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (limit = 20) => {
    try {
      setLoading(true);
      setError(null);

      const [notificationsResponse, unreadResponse] = await Promise.all([
        sdkClient.notifications.getNotifications({ limit }),
        sdkClient.notifications.getUnreadCount()
      ]);

      setNotifications(notificationsResponse.data || []);
      setUnreadCount(unreadResponse.unreadCount || 0);

      return notificationsResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';

      // Only set error for non-network issues
      if (!errorMessage.includes('timeout') && !errorMessage.includes('ECONNREFUSED')) {
        setError(errorMessage);
      }

      console.warn('Notifications service unavailable:', errorMessage);

      // Return empty result instead of throwing
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
      };
    } finally {
      setLoading(false);
    }
  }, [sdkClient]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationID: string) => {
    try {
      await sdkClient.notifications.markAsRead(notificationID);

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationID
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Don't throw - just log the error
    }
  }, [sdkClient]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await sdkClient.notifications.markAllAsRead();

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );

      setUnreadCount(0);

      return response.updatedCount;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return 0;
    }
  }, [sdkClient]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationID: string) => {
    try {
      await sdkClient.notifications.deleteNotification(notificationID);

      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationID);
      setNotifications(prev => prev.filter(n => n.id !== notificationID));

      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [sdkClient, notifications]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
    }

    pollInterval.current = setInterval(() => {
      fetchNotifications(10).catch(() => {
        // Silently handle polling errors
      });
    }, pollIntervalMs);
  }, [fetchNotifications, pollIntervalMs]);

  // Initialize
  useEffect(() => {
    if (autoFetch) {
      // Initial fetch
      fetchNotifications(20);

      // Start polling
      startPolling();
    }

    // Cleanup
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [autoFetch, fetchNotifications, startPolling]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: () => fetchNotifications(20),
  };
};
