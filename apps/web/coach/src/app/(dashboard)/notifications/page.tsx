'use client'

import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  X,
  Mail,
  Users,
  Calendar,
  Star,
  Filter,
  Search,
  CheckCircle,
  MoreVertical,
  ArrowLeft,
  Heart,
  MessageSquare,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@nlc-ai/web-shared';
import { NotificationResponse, NotificationPriority, NotificationFilters } from '@nlc-ai/sdk-notifications';
import { sdkClient } from '@/lib/sdk-client';

const getNotificationIcon = (type: string) => {
  const iconProps = { className: "w-5 h-5" };

  switch (type) {
    case 'client_registered':
    case 'member_joined':
    case 'member_left':
      return <Users {...iconProps} className="w-5 h-5 text-blue-400" />;
    case 'email_sequence':
    case 'email_bulk_operation':
      return <Mail {...iconProps} className="w-5 h-5 text-green-400" />;
    case 'client_booking':
    case 'booking':
      return <Calendar {...iconProps} className="w-5 h-5 text-purple-400" />;
    case 'testimonial':
      return <Star {...iconProps} className="w-5 h-5 text-yellow-400" />;
    case 'system':
    case 'urgent':
      return <AlertCircle {...iconProps} className="w-5 h-5 text-orange-400" />;
    case 'payment_success':
    case 'payment_failed':
    case 'invoice_issued':
      return <DollarSign {...iconProps} className="w-5 h-5 text-emerald-400" />;
    case 'post_liked':
    case 'comment_liked':
      return <Heart {...iconProps} className="w-5 h-5 text-pink-400" />;
    case 'post_commented':
    case 'comment_reply':
    case 'message_received':
      return <MessageSquare {...iconProps} className="w-5 h-5 text-blue-400" />;
    case 'course':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-indigo-400" />;
    default:
      return <Bell {...iconProps} className="w-5 h-5 text-stone-400" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case NotificationPriority.URGENT:
      return 'border-l-red-500 bg-red-500/5';
    case NotificationPriority.HIGH:
      return 'border-l-orange-500 bg-orange-500/5';
    case NotificationPriority.NORMAL:
      return 'border-l-blue-500 bg-blue-500/5';
    case NotificationPriority.LOW:
      return 'border-l-gray-500 bg-gray-500/5';
    default:
      return 'border-l-gray-500';
  }
};

const formatTimestamp = (timestamp: string | Date) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

const NotificationsPage = () => {
  const router = useRouter();
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, _] = useState(1);
  const [localNotifications, setLocalNotifications] = useState<NotificationResponse[]>([]);

  const {
    notifications,
    unreadCount,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications(sdkClient, {
    autoConnect: true,
    playSound: false, // Disable sound on this page
    showToast: false, // Disable toasts on this page
  });

  // Initialize local notifications
  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  // Build filters for API
  const buildFilters = useCallback((): NotificationFilters => {
    const filters: NotificationFilters = {
      page,
      limit: 20,
    };

    if (filterStatus === 'unread') filters.isRead = false;
    if (filterStatus === 'read') filters.isRead = true;
    if (filterPriority !== 'all') filters.priority = filterPriority;
    if (filterType !== 'all') filters.type = filterType;

    return filters;
  }, [page, filterStatus, filterPriority, filterType]);

  // Fetch notifications when filters change
  useEffect(() => {
    const filters = buildFilters();
    fetchNotifications(filters);
  }, [buildFilters, fetchNotifications]);

  // Client-side search filtering
  const filteredNotifications = localNotifications.filter(notification => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        notification.metadata?.clientName?.toLowerCase().includes(query);
    }
    return true;
  });

  const handleMarkAsRead = async (notificationIDs: string[]) => {
    for (const id of notificationIDs) {
      await markAsRead(id);
    }
    setSelectedNotifications(new Set());
  };

  const handleMarkAsUnread = async (notificationIDs: string[]) => {
    // This would need to be implemented in the SDK
    // For now, we'll just update locally
    setLocalNotifications(prev =>
      prev.map(notification =>
        notificationIDs.includes(notification.id)
          ? { ...notification, isRead: false, readAt: undefined }
          : notification
      )
    );
    setSelectedNotifications(new Set());
  };

  const archiveNotifications = async (notificationIDs: string[]) => {
    // Archive functionality would need backend support
    // For now, just remove from local state
    setLocalNotifications(prev =>
      prev.filter(notification => !notificationIDs.includes(notification.id))
    );
    setSelectedNotifications(new Set());
  };

  const deleteNotifications = async (notificationIDs: string[]) => {
    // Delete functionality would need backend support
    // For now, just remove from local state
    setLocalNotifications(prev =>
      prev.filter(notification => !notificationIDs.includes(notification.id))
    );
    setSelectedNotifications(new Set());
  };

  const toggleSelection = (notificationID: string) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(notificationID)) {
      newSelection.delete(notificationID);
    } else {
      newSelection.add(notificationID);
    }
    setSelectedNotifications(newSelection);
  };

  const selectAll = () => {
    setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
  };

  const clearSelection = () => {
    setSelectedNotifications(new Set());
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'client_registered', label: 'Clients' },
    { value: 'email_sequence', label: 'Emails' },
    { value: 'client_booking', label: 'Bookings' },
    { value: 'testimonial', label: 'Testimonials' },
    { value: 'payment_success', label: 'Payments' },
    { value: 'post_commented', label: 'Community' },
    { value: 'system', label: 'System' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: NotificationPriority.URGENT, label: 'Urgent' },
    { value: NotificationPriority.HIGH, label: 'High' },
    { value: NotificationPriority.NORMAL, label: 'Normal' },
    { value: NotificationPriority.LOW, label: 'Low' },
  ];

  if (error) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-white text-lg font-medium mb-2">Failed to load notifications</h3>
        <p className="text-stone-400">{error}</p>
        <button
          onClick={() => fetchNotifications(buildFilters())}
          className="mt-4 px-4 py-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-stone-300 hover:text-white transition-colors rounded-lg hover:bg-neutral-800/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white text-2xl font-semibold">Notifications</h1>
            <p className="text-stone-400 text-sm">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedNotifications.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-stone-300 text-sm">
                {selectedNotifications.size} selected
              </span>
              <button
                onClick={() => handleMarkAsRead(Array.from(selectedNotifications))}
                className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
              >
                Mark Read
              </button>
              <button
                onClick={() => archiveNotifications(Array.from(selectedNotifications))}
                className="px-3 py-1.5 bg-neutral-600/20 text-stone-300 rounded-lg hover:bg-neutral-600/30 transition-colors text-sm"
              >
                Archive
              </button>
              <button
                onClick={clearSelection}
                className="p-1.5 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-800/50 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-stone-400 focus:border-fuchsia-400 focus:outline-none"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg border transition-colors flex items-center gap-2 ${
              showFilters
                ? 'bg-fuchsia-600/20 border-fuchsia-400 text-fuchsia-300'
                : 'bg-neutral-800/50 border-neutral-700 text-stone-300 hover:border-fuchsia-400'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-neutral-800/30 border border-neutral-700 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-fuchsia-400 focus:outline-none"
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-fuchsia-400 focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-fuchsia-400 focus:outline-none"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Quick Actions */}
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">Quick Actions</label>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
                  >
                    Mark All Read
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-stone-500 mx-auto mb-4" />
            <h3 className="text-stone-300 text-lg font-medium mb-2">No notifications found</h3>
            <p className="text-stone-400">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative bg-gradient-to-r from-neutral-800/30 to-neutral-900/30 border border-neutral-700 rounded-lg overflow-hidden transition-all hover:border-neutral-600 ${
                !notification.isRead ? getPriorityColor(notification.priority) : ''
              } ${selectedNotifications.has(notification.id) ? 'ring-2 ring-fuchsia-400' : ''}`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-fuchsia-600 focus:ring-fuchsia-400 focus:ring-offset-0"
                    />
                  </div>

                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`font-medium mb-1 ${
                          notification.isRead ? 'text-stone-300' : 'text-white'
                        }`}>
                          {notification.title}
                        </h3>

                        <p className="text-stone-400 text-sm mb-2 line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-stone-500">
                            {formatTimestamp(notification.createdAt)}
                          </span>

                          {notification.metadata?.clientName && (
                            <span className="text-fuchsia-400">
                              {notification.metadata.clientName}
                            </span>
                          )}

                          {notification.metadata?.amount && (
                            <span className="text-emerald-400">
                              {notification.metadata.amount}
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            notification.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              notification.priority === 'normal' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                          }`}>
                            {notification.priority}
                          </span>
                        </div>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-fuchsia-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="relative group">
                    <button className="p-1 text-stone-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Quick actions on hover */}
                    <div className="absolute right-0 top-8 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[120px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          notification.isRead ? handleMarkAsUnread([notification.id]) : handleMarkAsRead([notification.id]);
                        }}
                        className="w-full text-left px-3 py-2 text-stone-300 hover:bg-neutral-700 text-sm"
                      >
                        {notification.isRead ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveNotifications([notification.id]);
                        }}
                        className="w-full text-left px-3 py-2 text-stone-300 hover:bg-neutral-700 text-sm"
                      >
                        Archive
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotifications([notification.id]);
                        }}
                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-neutral-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More (if you want pagination) */}
      {filteredNotifications.length > 0 && (
        <div className="text-center pt-6">
          <button className="px-6 py-3 bg-neutral-800/50 border border-neutral-700 text-stone-300 rounded-lg hover:border-fuchsia-400 hover:text-white transition-colors">
            Load More Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

