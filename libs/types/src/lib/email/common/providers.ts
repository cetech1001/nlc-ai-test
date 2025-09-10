import {EmailMessageStatus, SendEmailRequest} from "../threads";

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
  sendEmail(message: SendEmailRequest, from: string): Promise<EmailDeliveryResult>;
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
