import {BaseEvent} from "@nlc-ai/api-messaging";

export interface EmailThreadCreatedEvent extends BaseEvent {
  eventType: 'email.thread.created';
  payload: {
    threadID: string;
    coachID: string;
    clientID?: string;
    leadID?: string;
    subject: string;
    participants: string[];
    createdAt: string;
  };
}

export interface EmailThreadUpdatedEvent extends BaseEvent {
  eventType: 'email.thread.updated';
  payload: {
    threadID: string;
    coachID: string;
    changes: Record<string, any>;
    updatedAt: string;
  };
}

export interface EmailThreadArchivedEvent extends BaseEvent {
  eventType: 'email.thread.archived';
  payload: {
    threadID: string;
    coachID: string;
    reason?: string;
    archivedAt: string;
  };
}

export interface EmailThreadEventPayloads {
  'email.thread.created': EmailThreadCreatedEvent['payload'];
  'email.thread.updated': EmailThreadUpdatedEvent['payload'];
  'email.thread.archived': EmailThreadArchivedEvent['payload'];
}

export type EmailThreadEvent =
  | EmailThreadCreatedEvent
  | EmailThreadUpdatedEvent
  | EmailThreadArchivedEvent;

export const EMAIL_THREAD_ROUTING_KEYS = {
  THREAD_CREATED: 'email.thread.created',
  THREAD_UPDATED: 'email.thread.updated',
  THREAD_ARCHIVED: 'email.thread.archived',
};
