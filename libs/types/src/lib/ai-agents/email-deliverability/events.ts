import {BaseEvent} from "../../base-event";

export interface EmailDeliverabilityAnalyzedEvent extends BaseEvent {
  eventType: 'email.deliverability.analyzed';
  payload: {
    emailID: string;
    coachID: string;
    overallScore: number;
    spamScore: number;
    contentScore: number;
    subjectScore: number;
    recommendations: string[];
    analyzedAt: string;
  };
}

export interface EmailSuppressionListUpdatedEvent extends BaseEvent {
  eventType: 'email.suppression.updated';
  payload: {
    email: string;
    action: 'added' | 'removed';
    reason: 'bounce' | 'complaint' | 'unsubscribe' | 'manual';
    coachID?: string;
    updatedAt: string;
  };
}

export interface EmailReputationChangedEvent extends BaseEvent {
  eventType: 'email.reputation.changed';
  payload: {
    coachID: string;
    domain?: string;
    ipAddress?: string;
    oldReputation: number;
    newReputation: number;
    factors: string[];
    changedAt: string;
  };
}

export type EmailDeliverabilityEvent =
  | EmailDeliverabilityAnalyzedEvent
  | EmailSuppressionListUpdatedEvent
  | EmailReputationChangedEvent

export interface EmailDeliverabilityEventPayloads {
  'email.deliverability.analyzed': EmailDeliverabilityAnalyzedEvent['payload'];
  'email.suppression.updated': EmailSuppressionListUpdatedEvent['payload'];
  'email.reputation.changed': EmailReputationChangedEvent['payload'];
}

export const EMAIL_DELIVERABILITY_ROUTING_KEYS = {
  DELIVERABILITY_ANALYZED: 'email.deliverability.analyzed',
  SUPPRESSION_UPDATED: 'email.suppression.updated',
  REPUTATION_CHANGED: 'email.reputation.changed',
};
