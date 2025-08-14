export interface EmailAnalytics {
  opened: boolean;
  clicked: boolean;
  bounced: boolean;
  complained: boolean;
  unsubscribed: boolean;
  openedAt?: Date;
  clickedAt?: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageID?: string;
  error?: string;
}
