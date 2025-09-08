import {
  ScheduledEmail,
  ScheduledEmailBatch,
  EmailDeliveryReport
} from './common';
import {EmailProvider} from "./enums";

export interface ScheduleEmailResponse {
  scheduledEmail: ScheduledEmail;
  estimatedSendTime: string;
  queuePosition?: number;
  success: boolean;
  message: string;
}

export interface ScheduleBulkEmailsResponse {
  batch: ScheduledEmailBatch;
  scheduledEmails: ScheduledEmail[];
  totalScheduled: number;
  estimatedCompletion: string;
  failedCount: number;
  errors: Array<{
    email: string;
    error: string;
  }>;
  success: boolean;
  message: string;
}

export interface ScheduleRecurringEmailResponse {
  recurringEmailID: string;
  nextOccurrences: string[];
  totalOccurrences: number;
  success: boolean;
  message: string;
}

export interface GetScheduledEmailsResponse {
  emails: ScheduledEmail[];
  total: number;
  hasMore: boolean;
  summary: {
    scheduled: number;
    processing: number;
    sent: number;
    failed: number;
    cancelled: number;
  };
  upcomingInNext24Hours: number;
}

export interface GetScheduledEmailResponse {
  email: ScheduledEmail;
  deliveryReport?: EmailDeliveryReport;
  relatedEmails?: ScheduledEmail[];
}

export interface UpdateScheduledEmailResponse {
  email: ScheduledEmail;
  changes: Record<string, any>;
  success: boolean;
  message: string;
}

export interface CancelScheduledEmailsResponse {
  cancelledCount: number;
  failedCount: number;
  errors: Array<{
    emailID: string;
    error: string;
  }>;
  success: boolean;
  message: string;
}

export interface RescheduleEmailResponse {
  email: ScheduledEmail;
  oldScheduledTime: string;
  newScheduledTime: string;
  queuePosition?: number;
  success: boolean;
  message: string;
}

export interface RetryFailedEmailResponse {
  email: ScheduledEmail;
  retryCount: number;
  newScheduledTime: string;
  success: boolean;
  message: string;
}

export interface GetEmailQueueStatusResponse {
  queueStatus: {
    totalInQueue: number;
    processingCount: number;
    scheduledNext1Hour: number;
    scheduledNext24Hours: number;
    scheduledNext7Days: number;
  };
  providerStatus: Array<{
    provider: EmailProvider;
    isHealthy: boolean;
    queueLength: number;
    avgProcessingTime: number;
    errorRate: number;
  }>;
  systemHealth: {
    isHealthy: boolean;
    avgDeliveryTime: number;
    successRate: number;
    lastProcessedAt: string;
  };
}

export interface PauseScheduledEmailsResponse {
  pausedCount: number;
  failedCount: number;
  pausedUntil?: string;
  errors: Array<{
    emailID: string;
    error: string;
  }>;
  success: boolean;
  message: string;
}

export interface ResumeScheduledEmailsResponse {
  resumedCount: number;
  failedCount: number;
  newScheduleTimes: Array<{
    emailID: string;
    scheduledFor: string;
  }>;
  errors: Array<{
    emailID: string;
    error: string;
  }>;
  success: boolean;
  message: string;
}

export interface DeleteScheduledEmailResponse {
  success: boolean;
  message: string;
  wasInProgress: boolean;
}

export interface GetBatchStatusResponse {
  batch: ScheduledEmailBatch;
  emails: ScheduledEmail[];
  progress: {
    percentage: number;
    estimatedTimeRemaining?: number;
    currentRate: number; // emails per minute
  };
}
