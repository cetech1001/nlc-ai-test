import {BaseEvent} from "../../base-event";

export interface EmailSequenceStartedEvent extends BaseEvent {
  eventType: 'email.sequence.started';
  payload: {
    sequenceID: string;
    participantID: string;
    participantType: 'lead' | 'client';
    coachID: string;
    sequenceType: string;
    totalEmails: number;
    startedAt: string;
  };
}

export interface EmailSequenceCompletedEvent extends BaseEvent {
  eventType: 'email.sequence.completed';
  payload: {
    sequenceID: string;
    participantID: string;
    participantType: 'lead' | 'client';
    coachID: string;
    totalEmailsSent: number;
    completedAt: string;
    conversionStatus?: 'converted' | 'not_converted';
  };
}

export interface EmailSequencePausedEvent extends BaseEvent {
  eventType: 'email.sequence.paused';
  payload: {
    sequenceID: string;
    participantID?: string;
    participantType?: 'lead' | 'client';
    coachID: string;
    reason: string;
    pausedEmailsCount: number;
    pausedAt: string;
  };
}

export interface EmailSequenceResumedEvent extends BaseEvent {
  eventType: 'email.sequence.resumed';
  payload: {
    sequenceID: string;
    participantID?: string;
    participantType?: 'lead' | 'client';
    coachID: string;
    resumedEmailsCount: number;
    resumedAt: string;
  };
}

export interface EmailSequenceParticipantAddedEvent extends BaseEvent {
  eventType: 'email.sequence.participant.added';
  payload: {
    sequenceID: string;
    participantID: string;
    participantType: 'lead' | 'client';
    coachID: string;
    addedAt: string;
    startImmediately: boolean;
  };
}

export interface EmailSequenceParticipantRemovedEvent extends BaseEvent {
  eventType: 'email.sequence.participant.removed';
  payload: {
    sequenceID: string;
    participantID: string;
    participantType: 'lead' | 'client';
    coachID: string;
    reason: string;
    removedAt: string;
    cancelledEmails: number;
  };
}

export interface EmailSequenceEventPayloads {
  'email.sequence.started': EmailSequenceStartedEvent['payload'];
  'email.sequence.completed': EmailSequenceCompletedEvent['payload'];
  'email.sequence.paused': EmailSequencePausedEvent['payload'];
  'email.sequence.resumed': EmailSequenceResumedEvent['payload'];
  'email.sequence.participant.added': EmailSequenceParticipantAddedEvent['payload'];
  'email.sequence.participant.removed': EmailSequenceParticipantRemovedEvent['payload'];
}

export type EmailSequenceEvent =
  | EmailSequenceStartedEvent
  | EmailSequenceCompletedEvent
  | EmailSequencePausedEvent
  | EmailSequenceResumedEvent
  | EmailSequenceParticipantAddedEvent
  | EmailSequenceParticipantRemovedEvent;

export const EMAIL_SEQUENCE_ROUTING_KEYS = {
  SEQUENCE_STARTED: 'email.sequence.started',
  SEQUENCE_COMPLETED: 'email.sequence.completed',
  SEQUENCE_PAUSED: 'email.sequence.paused',
  SEQUENCE_RESUMED: 'email.sequence.resumed',
  SEQUENCE_PARTICIPANT_ADDED: 'email.sequence.participant.added',
  SEQUENCE_PARTICIPANT_REMOVED: 'email.sequence.participant.removed',
};
