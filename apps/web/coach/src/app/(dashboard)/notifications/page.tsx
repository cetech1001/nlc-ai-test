'use client'

import { useState, useMemo } from 'react';
import {
  Bell,
  X,
  Clock,
  Mail,
  Users,
  Calendar,
  Star,
  Filter,
  Search,
  CheckCircle,
  MoreVertical,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationItem {
  id: string;
  type: 'client' | 'email' | 'booking' | 'testimonial' | 'system' | 'payment' | 'course';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isArchived: boolean;
  priority: 'low' | 'normal' | 'high';
  actionUrl?: string;
  metadata?: {
    clientName?: string;
    amount?: string;
    courseName?: string;
  };
}

// Extended mock notifications data
const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'client',
    title: 'New Client Registration',
    message: 'Sarah Johnson has signed up for your Premium Coaching Program and completed the onboarding process.',
    timestamp: '2024-01-20T10:30:00Z',
    isRead: false,
    isArchived: false,
    priority: 'high',
    actionUrl: '/clients/abc123',
    metadata: { clientName: 'Sarah Johnson' }
  },
  {
    id: '2',
    type: 'email',
    title: 'Client Email Response',
    message: 'Maria Rodriguez replied to your email about Module 3 and has some questions about the implementation strategies.',
    timestamp: '2024-01-20T09:15:00Z',
    isRead: false,
    isArchived: false,
    priority: 'normal',
    actionUrl: '/emails/thread-456',
    metadata: { clientName: 'Maria Rodriguez' }
  },
  {
    id: '3',
    type: 'booking',
    title: 'New Booking Confirmation',
    message: 'James Miller booked a 1-on-1 Power Session for tomorrow at 2:00 PM. He mentioned wanting to focus on business scaling strategies.',
    timestamp: '2024-01-20T08:45:00Z',
    isRead: true,
    isArchived: false,
    priority: 'normal',
    actionUrl: '/calendar',
    metadata: { clientName: 'James Miller' }
  },
  {
    id: '4',
    type: 'testimonial',
    title: 'New 5-Star Testimonial Received',
    message: 'Alex Thompson left an amazing 5-star review for your "Business Breakthrough" program, highlighting the incredible ROI.',
    timestamp: '2024-01-19T16:20:00Z',
    isRead: false,
    isArchived: false,
    priority: 'normal',
    actionUrl: '/testimonials',
    metadata: { clientName: 'Alex Thompson' }
  },
  {
    id: '5',
    type: 'system',
    title: 'AI Assistant Daily Report',
    message: 'Your Lead Nurturing assistant processed 12 new leads today with a 34% engagement rate. 3 leads are ready for personal follow-up.',
    timestamp: '2024-01-19T18:00:00Z',
    isRead: true,
    isArchived: false,
    priority: 'low',
    actionUrl: '/agents/lead-followup'
  },
  {
    id: '6',
    type: 'payment',
    title: 'Payment Received',
    message: 'Jennifer Walsh paid $2,497 for the VIP Coaching Package. Payment has been processed successfully.',
    timestamp: '2024-01-19T14:30:00Z',
    isRead: true,
    isArchived: false,
    priority: 'high',
    actionUrl: '/payment/requests',
    metadata: { clientName: 'Jennifer Walsh', amount: '$2,497' }
  },
  {
    id: '7',
    type: 'course',
    title: 'Course Completion',
    message: 'Michael Chen completed your "Mindset Mastery" course with a 95% score and requested the advanced module.',
    timestamp: '2024-01-19T11:15:00Z',
    isRead: true,
    isArchived: false,
    priority: 'normal',
    actionUrl: '/courses',
    metadata: { clientName: 'Michael Chen', courseName: 'Mindset Mastery' }
  },
  {
    id: '8',
    type: 'booking',
    title: 'Booking Cancellation',
    message: 'Lisa Park cancelled her session scheduled for today at 3:00 PM. Reason: Family emergency. She wants to reschedule.',
    timestamp: '2024-01-19T09:00:00Z',
    isRead: false,
    isArchived: false,
    priority: 'high',
    actionUrl: '/calendar'
  },
  {
    id: '9',
    type: 'email',
    title: 'Bulk Email Campaign Results',
    message: 'Your weekly newsletter achieved a 42% open rate and 8% click-through rate. 15 recipients replied with questions.',
    timestamp: '2024-01-18T20:00:00Z',
    isRead: true,
    isArchived: false,
    priority: 'low',
    actionUrl: '/emails'
  },
  {
    id: '10',
    type: 'system',
    title: 'System Maintenance Complete',
    message: 'Scheduled maintenance has been completed. All AI assistants are running optimally with improved response times.',
    timestamp: '2024-01-18T02:00:00Z',
    isRead: true,
    isArchived: false,
    priority: 'low',
    actionUrl: '/agents'
  }
];

const getNotificationIcon = (type: NotificationItem['type']) => {
  const iconProps = { className: "w-5 h-5" };

  switch (type) {
    case 'client':
      return <Users {...iconProps} className="w-5 h-5 text-blue-400" />;
    case 'email':
      return <Mail {...iconProps} className="w-5 h-5 text-green-400" />;
    case 'booking':
      return <Calendar {...iconProps} className="w-5 h-5 text-purple-400" />;
    case 'testimonial':
      return <Star {...iconProps} className="w-5 h-5 text-yellow-400" />;
    case 'system':
      return <Clock {...iconProps} className="w-5 h-5 text-orange-400" />;
    case 'payment':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-emerald-400" />;
    case 'course':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-indigo-400" />;
    default:
      return <Bell {...iconProps} className="w-5 h-5 text-stone-400" />;
  }
};

const getPriorityColor = (priority: NotificationItem['priority']) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500 bg-red-500/5';
    case 'normal':
      return 'border-l-blue-500 bg-blue-500/5';
    case 'low':
      return 'border-l-gray-500 bg-gray-500/5';
    default:
      return 'border-l-gray-500';
  }
};

const formatTimestamp = (timestamp: string) => {
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
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | NotificationItem['type']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Filter by type
      if (filterType !== 'all' && notification.type !== filterType) return false;

      // Filter by read status
      if (filterStatus === 'unread' && notification.isRead) return false;
      if (filterStatus === 'read' && !notification.isRead) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query) ||
          notification.metadata?.clientName?.toLowerCase().includes(query);
      }

      return !notification.isArchived;
    });
  }, [notifications, filterType, filterStatus, searchQuery]);

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;

  const markAsRead = (notificationIDs: string[]) => {
    setNotifications(prev =>
      prev.map(notification =>
        notificationIDs.includes(notification.id)
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAsUnread = (notificationIDs: string[]) => {
    setNotifications(prev =>
      prev.map(notification =>
        notificationIDs.includes(notification.id)
          ? { ...notification, isRead: false }
          : notification
      )
    );
  };

  const archiveNotifications = (notificationIDs: string[]) => {
    setNotifications(prev =>
      prev.map(notification =>
        notificationIDs.includes(notification.id)
          ? { ...notification, isArchived: true }
          : notification
      )
    );
    setSelectedNotifications(new Set());
  };

  const deleteNotifications = (notificationIDs: string[]) => {
    setNotifications(prev =>
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

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'client', label: 'Clients' },
    { value: 'email', label: 'Emails' },
    { value: 'booking', label: 'Bookings' },
    { value: 'testimonial', label: 'Testimonials' },
    { value: 'payment', label: 'Payments' },
    { value: 'course', label: 'Courses' },
    { value: 'system', label: 'System' },
  ];

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
                onClick={() => markAsRead(Array.from(selectedNotifications))}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as typeof filterType)}
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
                    onClick={() => markAsRead(filteredNotifications.filter(n => !n.isRead).map(n => n.id))}
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
                            {formatTimestamp(notification.timestamp)}
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
                          notification.isRead ? markAsUnread([notification.id]) : markAsRead([notification.id]);
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
