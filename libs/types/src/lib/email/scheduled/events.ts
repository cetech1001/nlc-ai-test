import {BaseEvent} from "@nlc-ai/api-messaging";

export interface ScheduledEmailCreatedEvent extends BaseEvent {
  eventType: 'email.scheduled.created';
  payload: {
    scheduledEmailID: string;
    recipientEmail: string;
    scheduledFor: string;
    coachID: string;
    leadID?: string;
    clientID?: string;
    sequenceOrder?: number;
    emailSequenceID?: string;
    createdAt: string;
  };
}

export interface ScheduledEmailSentEvent extends BaseEvent {
  eventType: 'email.scheduled.sent';
  payload: {
    scheduledEmailID: string;
    providerMessageID: string;
    recipientEmail: string;
    coachID: string;
    leadID?: string;
    clientID?: string;
    sequenceOrder?: number;
    emailSequenceID?: string;
    sentAt: string;
  };
}

export interface ScheduledEmailFailedEvent extends BaseEvent {
  eventType: 'email.scheduled.failed';
  payload: {
    scheduledEmailID: string;
    recipientEmail: string;
    coachID: string;
    leadID?: string;
    clientID?: string;
    error: string;
    retryCount: number;
    failedAt: string;
  };
}

export interface ScheduledEmailCancelledEvent extends BaseEvent {
  eventType: 'email.scheduled.cancelled';
  payload: {
    scheduledEmailID: string;
    recipientEmail: string;
    coachID: string;
    leadID?: string;
    clientID?: string;
    reason: string;
    cancelledAt: string;
  };
}

export interface ScheduledEmailRescheduledEvent extends BaseEvent {
  eventType: 'email.scheduled.rescheduled';
  payload: {
    scheduledEmailID: string;
    recipientEmail: string;
    coachID: string;
    oldScheduledTime: string;
    newScheduledTime: string;
    reason?: string;
    rescheduledAt: string;
  };
}

export interface ScheduledEmailEventPayloads {
  'email.scheduled.created': ScheduledEmailCreatedEvent['payload'];
  'email.scheduled.sent': ScheduledEmailSentEvent['payload'];
  'email.scheduled.failed': ScheduledEmailFailedEvent['payload'];
  'email.scheduled.cancelled': ScheduledEmailCancelledEvent['payload'];
  'email.scheduled.rescheduled': ScheduledEmailRescheduledEvent['payload'];
}

export type ScheduledEmailEvent =
  | ScheduledEmailCreatedEvent
  | ScheduledEmailSentEvent
  | ScheduledEmailFailedEvent
  | ScheduledEmailCancelledEvent
  | ScheduledEmailRescheduledEvent;

export const SCHEDULED_EMAIL_ROUTING_KEYS = {
  SCHEDULED_CREATED: 'email.scheduled.created',
  SCHEDULED_SENT: 'email.scheduled.sent',
  SCHEDULED_FAILED: 'email.scheduled.failed',
  SCHEDULED_CANCELLED: 'email.scheduled.cancelled',
  SCHEDULED_RESCHEDULED: 'email.scheduled.rescheduled',
};
