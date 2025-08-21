// File: apps/web/coach/src/hooks/useNotifications.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationResponse, NotificationFilters, NotificationPriority } from '@nlc-ai/sdk-notifications';
import { toast } from 'sonner';
import {NLCClient} from "@nlc-ai/sdk-main"; // Assuming you use sonner for toasts

interface UseNotificationsOptions {
  autoConnect?: boolean;
  playSound?: boolean;
  showToast?: boolean;
  pollingIntervalMs?: number;
}

export const useNotifications = (sdkClient: NLCClient, options: UseNotificationsOptions = {}) => {
  const {
    autoConnect = true,
    playSound = true,
    showToast = true,
    pollingIntervalMs = 30000, // 30 seconds
  } = options;

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsCleanup = useRef<(() => void) | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for notification sounds
  useEffect(() => {
    if (playSound && typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.5;
    }
  }, [playSound]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await sdkClient.notifications.getNotifications(filters);
      setNotifications(response.data);

      // Update unread count
      const unreadResponse = await sdkClient.notifications.getUnreadCount();
      setUnreadCount(unreadResponse.unreadCount);

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationID: string) => {
    try {
      await sdkClient.notifications.markAsRead(notificationID);

      setNotifications(prev =>
        prev.map(n => n.id === notificationID ? { ...n, isRead: true, readAt: new Date() } : n)
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await sdkClient.notifications.markAllAsRead();

      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );

      setUnreadCount(0);

      return response.updatedCount;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, []);

  // Handle new notification from WebSocket
  const handleNewNotification = useCallback((notification: NotificationResponse) => {
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);

    // Update unread count if notification is unread
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }

    // Play sound
    if (playSound && audioRef.current && !notification.isRead) {
      audioRef.current.play().catch(console.error);
    }

    // Show toast notification
    if (showToast && !notification.isRead) {
      const toastType = notification.priority === NotificationPriority.URGENT ? 'error' :
        notification.priority === NotificationPriority.HIGH ? 'warning' :
          'info';

      toast[toastType](notification.title, {
        description: notification.message,
        action: notification.actionUrl ? {
          label: 'View',
          onClick: () => window.location.href = notification.actionUrl!
        } : undefined,
      });
    }
  }, [playSound, showToast]);

  // Connect to WebSocket for real-time notifications
  const connectWebSocket = useCallback(() => {
    if (wsCleanup.current) {
      wsCleanup.current();
    }

    try {
      wsCleanup.current = sdkClient.notifications.connectWebSocket(handleNewNotification);
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
    }
  }, [handleNewNotification]);

  // Set up polling for notifications
  const startPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }

    pollingInterval.current = setInterval(() => {
      fetchNotifications({ limit: 10 }).catch(console.error);
    }, pollingIntervalMs);
  }, [fetchNotifications, pollingInterval]);

  // Initialize
  useEffect(() => {
    if (autoConnect) {
      // Initial fetch
      fetchNotifications({ limit: 20 });

      // Connect WebSocket
      connectWebSocket();

      // Start polling as fallback
      startPolling();
    }

    // Cleanup
    return () => {
      if (wsCleanup.current) {
        wsCleanup.current();
      }
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [autoConnect, connectWebSocket, fetchNotifications, startPolling]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refresh: () => fetchNotifications({ limit: 20 }),
  };
};

// File: apps/web/coach/src/hooks/useNotificationPreferences.ts



// File: apps/web/coach/src/hooks/useCommunityNotifications.ts

