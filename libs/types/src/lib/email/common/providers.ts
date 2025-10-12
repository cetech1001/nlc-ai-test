import {EmailAttachment, EmailMessageStatus, EmailThreadPriority} from "../threads";

export interface SendEmailRequest {
  threadID?: string;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  text?: string;
  html?: string;
  templateID?: string;
  templateVariables?: Record<string, any>;
  attachments?: EmailAttachment[];
  scheduleFor?: string;
  priority?: EmailThreadPriority;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface EmailDeliveryResult {
  messageID: string;
  providerMessageID: string;
  status: EmailMessageStatus.SENT | EmailMessageStatus.FAILED;
  timestamp: string;
  error?: string;
}

export interface EmailProviderHealth {
  provider: string;
  isHealthy: boolean;
  status: string;
  responseTime: number;
  lastChecked: string;
  errorRate: number;
  quotaUsage?: {
    used: number;
    limit: number;
    resetTime?: string;
  };
  issues?: string[];
}

export interface IEmailProvider {
  sendEmail(message: SendEmailRequest, from?: string): Promise<EmailDeliveryResult>;
  sendBulkEmails(messages: SendEmailRequest[], from: string): Promise<EmailDeliveryResult[]>;
  getHealth(): Promise<EmailProviderHealth>;
  validateEmail(email: string): boolean;
  getDeliveryStatus(messageID: string): Promise<{
    status: string;
    events: Array<{
      event: string;
      timestamp: string;
      data?: any;
    }>;
  }>;
}
