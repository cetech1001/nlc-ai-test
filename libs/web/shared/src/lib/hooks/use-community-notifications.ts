console.log("Testing");
/*
import { useEffect } from 'react';
import { useNotifications } from './use-notifications';
import { NotificationType } from '@nlc-ai/sdk-notifications';

interface CommunityNotificationHandlers {
  onPostLiked?: (notification: any) => void;
  onPostCommented?: (notification: any) => void;
  onMemberJoined?: (notification: any) => void;
  onMessageReceived?: (notification: any) => void;
}

export const useCommunityNotifications = (handlers: CommunityNotificationHandlers = {}) => {
  const { notifications, unreadCount, markAsRead } = useNotifications({
    autoConnect: true,
    playSound: true,
    showToast: true,
  });

  // Filter community-related notifications
  const communityNotifications = notifications.filter(n =>
    [
      NotificationType.POST_CREATED,
      NotificationType.POST_LIKED,
      NotificationType.POST_COMMENTED,
      NotificationType.COMMENT_LIKED,
      NotificationType.COMMENT_REPLY,
      NotificationType.MEMBER_JOINED,
      NotificationType.MEMBER_LEFT,
      NotificationType.MESSAGE_RECEIVED,
    ].includes(n.type as NotificationType)
  );

  // Handle specific notification types
  useEffect(() => {
    communityNotifications.forEach(notification => {
      if (!notification.isRead) {
        switch (notification.type) {
          case NotificationType.POST_LIKED:
            handlers.onPostLiked?.(notification);
            break;
          case NotificationType.POST_COMMENTED:
            handlers.onPostCommented?.(notification);
            break;
          case NotificationType.MEMBER_JOINED:
            handlers.onMemberJoined?.(notification);
            break;
          case NotificationType.MESSAGE_RECEIVED:
            handlers.onMessageReceived?.(notification);
            break;
        }
      }
    });
  }, [communityNotifications, handlers]);

  return {
    communityNotifications,
    unreadCount,
    markAsRead,
  };
};
*/
