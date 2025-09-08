import {EmailProvider, RecurringPattern, ScheduledEmailStatus, ScheduledEmailType} from "./enums";

export interface ScheduledEmail {
  id: string;
  emailSequenceID?: string;
  leadID?: string;
  coachID?: string;
  clientID?: string;
  threadID?: string;
  to: string;
  subject: string;
  body: string;
  sequenceOrder: number;
  scheduledFor: string;
  sentAt?: string;
  status: ScheduledEmailStatus;
  errorMessage?: Record<string, any>;
  emailProvider?: EmailProvider;
  providerMessageID?: string;
  metadata?: Record<string, any>;
  openedAt?: string;
  clickedAt?: string;
  type: ScheduledEmailType;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringEmailSettings {
  pattern: RecurringPattern;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: string;
  maxOccurrences?: number;
  timezone: string;
}

export interface ScheduledEmailBatch {
  id: string;
  name: string;
  description?: string;
  coachID: string;
  totalEmails: number;
  sentEmails: number;
  failedEmails: number;
  pendingEmails: number;
  batchStatus: 'preparing' | 'sending' | 'completed' | 'failed' | 'cancelled';
  scheduledFor: string;
  startedAt?: string;
  completedAt?: string;
  estimatedCompletion?: string;
  createdAt: string;
}

export interface EmailDeliveryReport {
  scheduledEmailID: string;
  deliveryStatus: 'delivered' | 'bounced' | 'dropped' | 'deferred';
  timestamp: string;
  reason?: string;
  response?: string;
  attempts: number;
}

export interface SchedulingRule {
  id: string;
  name: string;
  coachID: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }>;
  actions: Array<{
    type: 'schedule' | 'delay' | 'cancel' | 'change_template';
    parameters: Record<string, any>;
  }>;
  isActive: boolean;
  priority: number;
}
