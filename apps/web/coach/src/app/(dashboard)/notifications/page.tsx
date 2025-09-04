'use client'

import { useState } from 'react';
import {
  Bell,
  X,
  Mail,
  Users,
  Calendar,
  Star,
  Search,
  CheckCircle,
  MoreVertical,
  Heart,
  MessageSquare,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {BackTo, DataFilter, PageHeader, useNotifications } from '@nlc-ai/web-shared';
import { sdkClient } from '@/lib/sdk-client';
import {NotificationResponse} from "@nlc-ai/sdk-notifications";
import { notificationFilters } from "@/lib";


const getNotificationIcon = (type: string) => {
  const iconProps = { className: "w-5 h-5" };

  switch (type) {
    case 'client_registered':
    case 'member_joined':
    case 'member_left':
    case 'member_invited':
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
    case 'post_created':
    case 'post_commented':
    case 'comment_reply':
    case 'message_received':
    case 'conversation_created':
      return <MessageSquare {...iconProps} className="w-5 h-5 text-blue-400" />;
    case 'course':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-indigo-400" />;
    default:
      return <Bell {...iconProps} className="w-5 h-5 text-stone-400" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'border-l-red-500 bg-red-500/5';
    case 'high':
      return 'border-l-orange-500 bg-orange-500/5';
    case 'normal':
      return 'border-l-blue-500 bg-blue-500/5';
    case 'low':
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
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications(sdkClient, {
    autoFetch: true,
    pollIntervalMs: 30000,
  });

  // Client-side filtering
  const filteredNotifications = notifications.filter(notification => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        notification.metadata?.communityName?.toLowerCase().includes(query) ||
        notification.metadata?.authorName?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filterType !== 'all' && notification.type !== filterType) {
      return false;
    }

    // Status filter
    if (filterStatus === 'unread' && notification.isRead) return false;
    if (filterStatus === 'read' && !notification.isRead) return false;

    // Priority filter
    if (filterPriority !== 'all' && notification.priority !== filterPriority) {
      return false;
    }

    return true;
  });

  const handleMarkAsRead = async (notificationIDs: string[]) => {
    for (const id of notificationIDs) {
      await markAsRead(id);
    }
    setSelectedNotifications(new Set());
  };

  const handleDelete = async (notificationIDs: string[]) => {
    for (const id of notificationIDs) {
      await deleteNotification(id);
    }
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

  if (error) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-white text-lg font-medium mb-2">Failed to load notifications</h3>
        <p className="text-stone-400">{error}</p>
        <button
          onClick={() => fetchNotifications(50)}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isFilterOpen && 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]'}`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackTo onClick={router.back}/>
            <PageHeader
              title={"Notifications"}
              subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}>
              <div className="flex flex-col w-full sm:flex-row gap-4">
                <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
                  />
                  <Search className="w-5 h-5 text-white" />
                </div>
                <DataFilter
                  filters={notificationFilters}
                  values={{
                    type: filterType,
                    status: filterStatus,
                    priority: filterPriority,
                  }}
                  onChange={(newFilters) => {
                    setFilterType(newFilters.type || 'all');
                    setFilterStatus(newFilters.status as typeof filterStatus || 'all');
                    setFilterPriority(newFilters.priority || 'all');
                  }}
                  onReset={() => {
                    setFilterType('all');
                    setFilterStatus('all');
                    setFilterPriority('all');
                    setSearchQuery('');
                  }}
                  setIsFilterOpen={setIsFilterOpen}
                />
              </div>
            </PageHeader>
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
                  onClick={() => handleDelete(Array.from(selectedNotifications))}
                  className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                >
                  Delete
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

        {/* Notifications List */}
        <div className="space-y-2">
          {loading && notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-3"></div>
              <p className="text-stone-400">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
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
                } ${selectedNotifications.has(notification.id) ? 'ring-2 ring-purple-400' : ''}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() => toggleSelection(notification.id)}
                        className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-purple-600 focus:ring-purple-400 focus:ring-offset-0"
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

                            {notification.metadata?.communityName && (
                              <span className="text-purple-400">
                              {notification.metadata.communityName}
                            </span>
                            )}

                            {notification.metadata?.authorName && (
                              <span className="text-blue-400">
                              by {notification.metadata.authorName}
                            </span>
                            )}

                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              notification.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                notification.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                  notification.priority === 'normal' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-gray-500/20 text-gray-400'
                            }`}>
                            {notification.priority}
                          </span>
                          </div>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
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
                            markAsRead(notification.id);
                          }}
                          className="w-full text-left px-3 py-2 text-stone-300 hover:bg-neutral-700 text-sm"
                        >
                          {notification.isRead ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
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

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center pt-6">
            <button
              onClick={() => fetchNotifications(50)}
              disabled={loading}
              className="px-6 py-3 bg-neutral-800/50 border border-neutral-700 text-stone-300 rounded-lg hover:border-purple-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Notifications'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
