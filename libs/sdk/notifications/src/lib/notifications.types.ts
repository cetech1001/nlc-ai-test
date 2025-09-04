export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationType {
  // Auth & Registration
  WELCOME = 'welcome',
  VERIFICATION = 'verification',
  PASSWORD_RESET = 'password_reset',

  // Client Management
  CLIENT_INVITE = 'client_invite',
  CLIENT_REGISTERED = 'client_registered',
  CLIENT_BOOKING = 'client_booking',

  // Community
  POST_CREATED = 'post_created',
  POST_LIKED = 'post_liked',
  POST_COMMENTED = 'post_commented',
  COMMENT_LIKED = 'comment_liked',
  COMMENT_REPLY = 'comment_reply',
  MEMBER_JOINED = 'member_joined',
  MEMBER_LEFT = 'member_left',

  // Messages
  MESSAGE_RECEIVED = 'message_received',
  CONVERSATION_CREATED = 'conversation_created',

  // Billing
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  SUBSCRIPTION_ACTIVE = 'subscription_active',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  INVOICE_ISSUED = 'invoice_issued',

  // Email
  EMAIL_SEQUENCE = 'email_sequence',
  EMAIL_BULK_OPERATION = 'email_bulk_operation',

  // System
  SYSTEM = 'system',
  TEST = 'test',
  URGENT = 'urgent',
}

export interface NotificationResponse {
  id: string;
  userID: string;
  userType: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface ActionResponse {
  message: string;
  updatedCount?: number;
}
