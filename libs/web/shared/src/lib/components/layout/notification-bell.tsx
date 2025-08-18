import { useState, useRef, useEffect } from 'react';
import { Bell, X, Clock, Mail, Users, Calendar, Star } from 'lucide-react';
import {useRouter} from "next/navigation";

interface NotificationItem {
  id: string;
  type: 'client' | 'email' | 'booking' | 'testimonial' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

// Mock notifications data
const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'client',
    title: 'New Client Registration',
    message: 'Sarah Johnson has signed up for your Premium Coaching Program',
    timestamp: '5 minutes ago',
    isRead: false,
    actionUrl: '/clients/abc123'
  },
  {
    id: '2',
    type: 'email',
    title: 'Client Email Response',
    message: 'Maria Rodriguez replied to your email about Module 3',
    timestamp: '1 hour ago',
    isRead: false,
    actionUrl: '/emails/thread-456'
  },
  {
    id: '3',
    type: 'booking',
    title: 'New Booking Confirmation',
    message: 'James Miller booked a 1-on-1 session for tomorrow at 2:00 PM',
    timestamp: '2 hours ago',
    isRead: true,
    actionUrl: '/calendar'
  },
  {
    id: '4',
    type: 'testimonial',
    title: 'New Testimonial Received',
    message: 'Alex Thompson left a 5-star review for your program',
    timestamp: '1 day ago',
    isRead: false,
    actionUrl: '/testimonials'
  },
  {
    id: '5',
    type: 'system',
    title: 'AI Assistant Update',
    message: 'Your Lead Nurturing assistant processed 12 new leads',
    timestamp: '2 days ago',
    isRead: true,
    actionUrl: '/agents/lead-followup'
  }
];

const getNotificationIcon = (type: NotificationItem['type']) => {
  switch (type) {
    case 'client':
      return <Users className="w-4 h-4 text-blue-400" />;
    case 'email':
      return <Mail className="w-4 h-4 text-green-400" />;
    case 'booking':
      return <Calendar className="w-4 h-4 text-purple-400" />;
    case 'testimonial':
      return <Star className="w-4 h-4 text-yellow-400" />;
    case 'system':
      return <Clock className="w-4 h-4 text-orange-400" />;
    default:
      return <Bell className="w-4 h-4 text-stone-400" />;
  }
};

export const NotificationBell = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

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

  const markAsRead = (notificationID: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationID
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const removeNotification = (notificationID: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationID)
    );
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      // You would navigate to the URL here
      // For example: router.push(notification.actionUrl);
      console.log('Navigate to:', notification.actionUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-300 hover:text-white transition-colors rounded-lg hover:bg-neutral-800/50"
      >
        <Bell className="w-6 h-6" />

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-neutral-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-fuchsia-400 text-sm hover:text-fuchsia-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-stone-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-12 h-12 text-stone-500 mx-auto mb-3" />
                <p className="text-stone-400">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-neutral-800/50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-fuchsia-600/5 border-l-2 border-l-fuchsia-600' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium ${
                            notification.isRead ? 'text-stone-300' : 'text-white'
                          }`}>
                            {notification.title}
                          </h4>

                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-fuchsia-500 rounded-full"></div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="p-1 text-stone-500 hover:text-stone-300 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-stone-400 text-sm mt-1 line-clamp-2">
                          {notification.message}
                        </p>

                        <p className="text-stone-500 text-xs mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-neutral-700 bg-neutral-800/50">
              <button onClick={() => router.push('/notifications')} className="w-full text-center text-fuchsia-400 hover:text-fuchsia-300 text-sm font-medium transition-colors">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
