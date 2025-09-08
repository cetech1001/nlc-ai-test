import { QueryParams } from '../../query-params';
import {
  ScheduledEmailStatus,
  ScheduledEmailType,
  EmailProvider,
} from './enums';
import { RecurringEmailSettings } from './common';

export interface ScheduleEmailRequest {
  to: string | string[];
  subject: string;
  body: string;
  scheduledFor: string;
  templateID?: string;
  templateVariables?: Record<string, any>;
  leadID?: string;
  clientID?: string;
  threadID?: string;
  emailSequenceID?: string;
  sequenceOrder?: number;
  type?: ScheduledEmailType;
  emailProvider?: EmailProvider;
  metadata?: Record<string, any>;
  maxRetries?: number;
}

export interface ScheduleBulkEmailsRequest {
  emails: Array<{
    to: string;
    subject: string;
    body: string;
    scheduledFor: string;
    templateID?: string;
    templateVariables?: Record<string, any>;
    leadID?: string;
    clientID?: string;
    metadata?: Record<string, any>;
  }>;
  batchName: string;
  batchDescription?: string;
  emailProvider?: EmailProvider;
}

export interface ScheduleRecurringEmailRequest {
  to: string | string[];
  subject: string;
  body: string;
  recurringSettings: RecurringEmailSettings;
  templateID?: string;
  templateVariables?: Record<string, any>;
  leadID?: string;
  clientID?: string;
  metadata?: Record<string, any>;
}

export interface GetScheduledEmailsRequest extends QueryParams {
  coachID?: string;
  leadID?: string;
  clientID?: string;
  emailSequenceID?: string;
  status?: ScheduledEmailStatus;
  type?: ScheduledEmailType;
  dateRange?: {
    start: string;
    end: string;
  };
  scheduledDateRange?: {
    start: string;
    end: string;
  };
}

export interface UpdateScheduledEmailRequest {
  scheduledFor?: string;
  subject?: string;
  body?: string;
  status?: ScheduledEmailStatus;
  metadata?: Record<string, any>;
}

export interface CancelScheduledEmailsRequest {
  emailIDs: string[];
  reason?: string;
}

export interface RescheduleEmailRequest {
  emailID: string;
  newScheduledTime: string;
  reason?: string;
}

export interface RetryFailedEmailRequest {
  emailID: string;
  newScheduledTime?: string;
  updateContent?: {
    subject?: string;
    body?: string;
  };
}

export interface GetEmailQueueStatusRequest {
  coachID?: string;
  timeRange?: 'next_hour' | 'next_day' | 'next_week';
}

export interface PauseScheduledEmailsRequest {
  emailIDs?: string[];
  coachID?: string;
  reason?: string;
  pauseUntil?: string;
}

export interface ResumeScheduledEmailsRequest {
  emailIDs?: string[];
  coachID?: string;
  newScheduleTime?: string;
}
