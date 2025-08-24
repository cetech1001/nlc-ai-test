import { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationResponse, NotificationFilters, NotificationPriority } from '@nlc-ai/sdk-notifications';
import { toast } from 'sonner';
import {NLCClient} from "@nlc-ai/sdk-main";

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
  const audioContext = useRef<AudioContext | null>(null);

  // Create notification sound programmatically
  const playNotificationSound = useCallback(() => {
    if (!playSound) return;

    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContext.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Create a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.type = 'sine';
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (err) {
      console.error('Failed to play notification sound:', err);
    }
  }, [playSound]);

  // Fetch notifications with better error handling
  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Check if notifications service is available first
      const response = await sdkClient.notifications.getNotifications(filters);
      setNotifications(response.data);

      // Update unread count
      const unreadResponse = await sdkClient.notifications.getUnreadCount();
      setUnreadCount(unreadResponse.unreadCount);

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';

      // Only set error if it's not a timeout - timeouts are expected when service is down
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

      setNotifications(prev =>
        prev.map(n => n.id === notificationID ? { ...n, isRead: true, readAt: new Date() } : n)
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

  // Handle new notification from WebSocket (currently not used)
  const handleNewNotification = useCallback((notification: NotificationResponse) => {
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);

    // Update unread count if notification is unread
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }

    // Play sound
    playNotificationSound();

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
  }, [playNotificationSound, showToast]);

  // Connect to WebSocket for real-time notifications (disabled for now)
  const connectWebSocket = useCallback(() => {
    if (wsCleanup.current) {
      wsCleanup.current();
    }

    try {
      wsCleanup.current = sdkClient.notifications.connectWebSocket(handleNewNotification);
    } catch (err) {
      console.warn('WebSocket connection not available, using polling only');
    }
  }, [sdkClient, handleNewNotification]);

  // Set up polling for notifications
  const startPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }

    pollingInterval.current = setInterval(() => {
      fetchNotifications({ limit: 10 }).catch(() => {
        // Silently handle polling errors - service might be down temporarily
      });
    }, pollingIntervalMs);
  }, [fetchNotifications, pollingIntervalMs]);

  // Initialize
  useEffect(() => {
    if (autoConnect) {
      // Initial fetch
      fetchNotifications({ limit: 20 });

      // Try to connect WebSocket first
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
    // WebSocket status methods
    isWebSocketConnected: () => wsCleanup.current !== null,
    reconnectWebSocket: connectWebSocket,
  };
};
