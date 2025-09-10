import {BaseEvent} from "@nlc-ai/api-messaging";

export interface EmailSentEvent extends BaseEvent {
  eventType: 'email.sent';
  payload: {
    emailID: string;
    to: string;
    subject: string;
    templateID?: string;
    providerMessageID: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
    sentAt: string;
  };
}

export interface EmailFailedEvent extends BaseEvent {
  eventType: 'email.failed';
  payload: {
    emailID: string;
    to: string;
    subject: string;
    error: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
    failedAt: string;
  };
}

export interface EmailOpenedEvent extends BaseEvent {
  eventType: 'email.opened';
  payload: {
    messageID: string;
    recipientEmail: string;
    openedAt: string;
    userAgent?: string;
    ipAddress?: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
  };
}

export interface EmailClickedEvent extends BaseEvent {
  eventType: 'email.clicked';
  payload: {
    messageID: string;
    recipientEmail: string;
    clickedUrl: string;
    clickedAt: string;
    userAgent?: string;
    ipAddress?: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
  };
}

export interface EmailBouncedEvent extends BaseEvent {
  eventType: 'email.bounced';
  payload: {
    messageID: string;
    recipientEmail: string;
    reason: string;
    bounceType: 'hard' | 'soft';
    bouncedAt: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
  };
}

export interface EmailComplainedEvent extends BaseEvent {
  eventType: 'email.complained';
  payload: {
    messageID: string;
    recipientEmail: string;
    complainedAt: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
  };
}

export interface EmailUnsubscribedEvent extends BaseEvent {
  eventType: 'email.unsubscribed';
  payload: {
    messageID: string;
    recipientEmail: string;
    unsubscribedAt: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
  };
}

export interface EmailRepliedEvent extends BaseEvent {
  eventType: 'email.replied';
  payload: {
    threadID: string;
    originalMessageID: string;
    replyMessageID: string;
    recipientEmail: string;
    repliedAt: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
  };
}

export type EmailCoreEvent =
  | EmailSentEvent
  | EmailFailedEvent
  | EmailOpenedEvent
  | EmailClickedEvent
  | EmailBouncedEvent
  | EmailComplainedEvent
  | EmailUnsubscribedEvent
  | EmailRepliedEvent;

export interface EmailCoreEventPayloads {
  'email.sent': EmailSentEvent['payload'];
  'email.failed': EmailFailedEvent['payload'];
  'email.opened': EmailOpenedEvent['payload'];
  'email.clicked': EmailClickedEvent['payload'];
  'email.bounced': EmailBouncedEvent['payload'];
  'email.complained': EmailComplainedEvent['payload'];
  'email.unsubscribed': EmailUnsubscribedEvent['payload'];
  'email.replied': EmailRepliedEvent['payload'];
}

export const CORE_EMAIL_ROUTING_KEYS = {
  SENT: 'email.sent',
  FAILED: 'email.failed',
  OPENED: 'email.opened',
  CLICKED: 'email.clicked',
  BOUNCED: 'email.bounced',
  COMPLAINED: 'email.complained',
  UNSUBSCRIBED: 'email.unsubscribed',
  REPLIED: 'email.replied',
};
