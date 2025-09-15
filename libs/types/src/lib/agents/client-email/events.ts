import {BaseEvent} from "../../base-event";

export interface ClientEmailResponseGeneratedEvent extends BaseEvent {
  eventType: 'email.client.response.generated';
  payload: {
    responseID: string;
    threadID: string;
    clientID: string;
    coachID: string;
    subject: string;
    confidence: number;
    generatedAt: string;
    aiModel: string;
  };
}

export interface ClientEmailResponseApprovedEvent extends BaseEvent {
  eventType: 'email.client.response.approved';
  payload: {
    responseID: string;
    threadID: string;
    clientID: string;
    coachID: string;
    approvedAt: string;
    sentAt?: string;
    wasModified: boolean;
  };
}

export interface ClientEmailResponseRejectedEvent extends BaseEvent {
  eventType: 'email.client.response.rejected';
  payload: {
    responseID: string;
    threadID: string;
    clientID: string;
    coachID: string;
    rejectedAt: string;
    reason?: string;
  };
}

export interface ClientEmailResponseEventPayload {
  'email.client.response.generated': ClientEmailResponseGeneratedEvent['payload'];
  'email.client.response.approved': ClientEmailResponseApprovedEvent['payload'];
  'email.client.response.rejected': ClientEmailResponseRejectedEvent['payload'];
}

export type ClientEmailEvent =
  | ClientEmailResponseGeneratedEvent
  | ClientEmailResponseApprovedEvent
  | ClientEmailResponseRejectedEvent;

export const CLIENT_RESPONSE_ROUTING_KEYS = {
  CLIENT_RESPONSE_GENERATED: 'email.client.response.generated',
  CLIENT_RESPONSE_APPROVED: 'email.client.response.approved',
  CLIENT_RESPONSE_REJECTED: 'email.client.response.rejected',
};
