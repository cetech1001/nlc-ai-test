import { BaseEvent } from '@nlc-ai/api-messaging';
import { LeadStatus, LeadType } from './enums';

export interface LeadCreatedEvent extends BaseEvent {
  eventType: 'lead.created';
  payload: {
    leadID: string;
    coachID?: string;
    leadType: LeadType;
    name: string;
    email: string;
    phone?: string;
    source?: string;
    status: LeadStatus;
    qualified?: boolean;
    createdAt: string;
  };
}

export interface LeadUpdatedEvent extends BaseEvent {
  eventType: 'lead.updated';
  payload: {
    leadID: string;
    coachID?: string;
    changes: Record<string, any>;
    updatedBy?: string;
    updatedAt: string;
  };
}

export interface LeadStatusChangedEvent extends BaseEvent {
  eventType: 'lead.status.changed';
  payload: {
    leadID: string;
    coachID?: string;
    previousStatus: LeadStatus;
    newStatus: LeadStatus;
    changedBy?: string;
    changedAt: string;
  };
}

export interface LeadConvertedEvent extends BaseEvent {
  eventType: 'lead.converted';
  payload: {
    leadID: string;
    coachID: string;
    clientID?: string;
    name: string;
    email: string;
    convertedAt: string;
    conversionSource?: string;
  };
}

export interface LeadQualifiedEvent extends BaseEvent {
  eventType: 'lead.qualified';
  payload: {
    leadID: string;
    coachID?: string;
    name: string;
    email: string;
    qualificationScore?: number;
    qualificationData?: Record<string, any>;
    qualifiedAt: string;
  };
}

export interface LeadDisqualifiedEvent extends BaseEvent {
  eventType: 'lead.disqualified';
  payload: {
    leadID: string;
    coachID?: string;
    name: string;
    email: string;
    reason?: string;
    disqualifiedAt: string;
  };
}

export interface LeadContactedEvent extends BaseEvent {
  eventType: 'lead.contacted';
  payload: {
    leadID: string;
    coachID?: string;
    contactMethod: 'email' | 'phone' | 'meeting';
    contactedBy?: string;
    notes?: string;
    contactedAt: string;
  };
}

export interface LeadMeetingScheduledEvent extends BaseEvent {
  eventType: 'lead.meeting.scheduled';
  payload: {
    leadID: string;
    coachID?: string;
    meetingDate: string;
    meetingTime?: string;
    scheduledBy?: string;
    scheduledAt: string;
  };
}

export interface LeadDeletedEvent extends BaseEvent {
  eventType: 'lead.deleted';
  payload: {
    leadID: string;
    coachID?: string;
    name: string;
    email: string;
    deletedBy?: string;
    deletedAt: string;
  };
}

export interface LeadFromLandingPageEvent extends BaseEvent {
  eventType: 'lead.landing.submitted';
  payload: {
    leadID: string;
    name: string;
    email: string;
    phone?: string;
    marketingOptIn: boolean;
    answers: Record<string, unknown>;
    qualified: boolean;
    submittedAt: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface LeadNurtureStartedEvent extends BaseEvent {
  eventType: 'lead.nurture.started';
  payload: {
    leadID: string;
    coachID: string;
    sequenceID: string;
    sequenceType: string;
    startedAt: string;
  };
}

export interface LeadScoreUpdatedEvent extends BaseEvent {
  eventType: 'lead.score.updated';
  payload: {
    leadID: string;
    coachID?: string;
    previousScore?: number;
    newScore: number;
    scoreFactors?: Record<string, any>;
    updatedAt: string;
  };
}

export type LeadEvent =
  | LeadCreatedEvent
  | LeadUpdatedEvent
  | LeadStatusChangedEvent
  | LeadConvertedEvent
  | LeadQualifiedEvent
  | LeadDisqualifiedEvent
  | LeadContactedEvent
  | LeadMeetingScheduledEvent
  | LeadDeletedEvent
  | LeadFromLandingPageEvent
  | LeadNurtureStartedEvent
  | LeadScoreUpdatedEvent;

// Event payload interfaces for easier typing
export interface LeadEventPayloads {
  'lead.created': LeadCreatedEvent['payload'];
  'lead.updated': LeadUpdatedEvent['payload'];
  'lead.status.changed': LeadStatusChangedEvent['payload'];
  'lead.converted': LeadConvertedEvent['payload'];
  'lead.qualified': LeadQualifiedEvent['payload'];
  'lead.disqualified': LeadDisqualifiedEvent['payload'];
  'lead.contacted': LeadContactedEvent['payload'];
  'lead.meeting.scheduled': LeadMeetingScheduledEvent['payload'];
  'lead.deleted': LeadDeletedEvent['payload'];
  'lead.landing.submitted': LeadFromLandingPageEvent['payload'];
  'lead.nurture.started': LeadNurtureStartedEvent['payload'];
  'lead.score.updated': LeadScoreUpdatedEvent['payload'];
}

// Constants for routing keys
export const LEAD_ROUTING_KEYS = {
  CREATED: 'lead.created',
  UPDATED: 'lead.updated',
  STATUS_CHANGED: 'lead.status.changed',
  CONVERTED: 'lead.converted',
  QUALIFIED: 'lead.qualified',
  DISQUALIFIED: 'lead.disqualified',
  CONTACTED: 'lead.contacted',
  MEETING_SCHEDULED: 'lead.meeting.scheduled',
  DELETED: 'lead.deleted',
  LANDING_SUBMITTED: 'lead.landing.submitted',
  NURTURE_STARTED: 'lead.nurture.started',
  SCORE_UPDATED: 'lead.score.updated',
} as const;
