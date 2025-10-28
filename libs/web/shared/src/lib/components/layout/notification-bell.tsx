'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Clock, MessageSquare, Heart, Users, DollarSign, AlertCircle } from 'lucide-react';
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

interface NotificationBellProps {
  goToNotifications: () => void;
  sdkClient: NLCClient;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ goToNotifications, sdkClient }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsResponse, unreadResponse] = await Promise.all([
        sdkClient.notifications.getNotifications({ limit: 10 }),
        sdkClient.notifications.getUnreadCount()
      ]);

      setNotifications(notificationsResponse.data || []);
      setUnreadCount(unreadResponse.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Don't show error to user, just fail silently
    } finally {
      setLoading(false);
    }
  };

  // Start polling for new notifications
  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds
    pollInterval.current = setInterval(fetchNotifications, 30000);

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'post_liked':
      case 'comment_liked':
        return <Heart className="w-4 h-4 text-pink-400" />;
      case 'post_commented':
      case 'comment_reply':
      case 'message_received':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'member_joined':
      case 'member_left':
      case 'member_invited':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'payment_success':
      case 'payment_failed':
      case 'invoice_issued':
        return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'system':
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await sdkClient.notifications.markAsRead(notification.id);
        // Update local state
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true, readAt: new Date() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      setIsOpen(false);
    } else {
      // If no actionUrl, navigate to notifications page
      goToNotifications();
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await sdkClient.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 transition-colors group"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-stone-300 group-hover:text-white transition-colors" />

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white text-xs font-semibold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Glow effect for new notifications */}
        {unreadCount > 0 && (
          <div className="absolute inset-0 rounded-lg bg-purple-500/20 blur-xl animate-pulse pointer-events-none" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-gradient-to-b from-neutral-900 to-black border border-neutral-700 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-neutral-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-lg">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white'
                    : 'bg-neutral-800 text-stone-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === 'unread'
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white'
                    : 'bg-neutral-800 text-stone-400 hover:text-white'
                }`}
              >
                Unread ({unreadCount})
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium bg-neutral-800 text-purple-400 hover:bg-neutral-700 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[480px]">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-3"></div>
                <p className="text-stone-400">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                <p className="text-stone-400">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-neutral-800/50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-neutral-800/20' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`font-medium text-sm ${
                              !notification.isRead ? 'text-white' : 'text-stone-300'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-stone-400 text-sm mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>

                          {/* Priority indicator */}
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${getPriorityColor(notification.priority)}`} />
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-stone-500" />
                          <span className="text-xs text-stone-500">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <span className="text-xs text-purple-400 font-medium">• New</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-black/90 backdrop-blur-sm border-t border-neutral-800 p-3">
            <button
              onClick={() => {
                goToNotifications();
                setIsOpen(false);
              }}
              className="w-full py-2 text-center text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
