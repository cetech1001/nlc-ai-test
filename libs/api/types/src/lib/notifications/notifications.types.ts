import {UserType} from "../auth";

export interface NotificationPayload {
  userID: string;
  userType: UserType;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  priority?: string;
  metadata?: Record<string, any>;
}

export interface DeliveryResult {
  success: boolean;
  messageID?: string;
  error?: string;
  deliveredAt?: Date;
}

export interface NotificationChannel {
  readonly name: string;

  send(payload: NotificationPayload): Promise<DeliveryResult>;

  isEnabled(userID: string, userType: UserType): Promise<boolean>;

  validatePayload(payload: NotificationPayload): boolean;
}

export interface ChannelConfig {
  enabled: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  batchSize?: number;
}

export interface DeliveryTracking {
  notificationID: string;
  channel: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  messageID?: string;
  error?: string;
  deliveredAt?: Date;
  retryCount: number;
}
