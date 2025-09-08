import { QueryParams } from '../../query-params';
import {
  BulkSequenceOperationType,
  EmailSequenceStatus,
  EmailSequenceTriggerType,
  EmailSequenceType, SequenceParticipantType
} from './enums';
import { SequenceEmail, EmailCondition } from './common';

export interface CreateEmailSequenceRequest {
  name: string;
  description?: string;
  type: EmailSequenceType;
  triggerType: EmailSequenceTriggerType;
  triggerConditions?: EmailCondition[];
  emails: Omit<SequenceEmail, 'id'>[];
}

export interface UpdateEmailSequenceRequest {
  name?: string;
  description?: string;
  type?: EmailSequenceType;
  triggerType?: EmailSequenceTriggerType;
  triggerConditions?: EmailCondition[];
  emails?: SequenceEmail[];
  status?: EmailSequenceStatus;
  isActive?: boolean;
}

export interface GetEmailSequencesRequest extends QueryParams {
  coachID?: string;
  status?: EmailSequenceStatus;
  type?: EmailSequenceType;
  triggerType?: EmailSequenceTriggerType;
  isActive?: boolean;
}

export interface AddParticipantToSequenceRequest {
  sequenceID: string;
  participantID: string;
  participantType: SequenceParticipantType;
  startImmediately?: boolean;
  customStartDate?: string;
  skipToEmailIndex?: number;
}

export interface RemoveParticipantFromSequenceRequest {
  sequenceID: string;
  participantID: string;
  reason?: string;
}

export interface PauseSequenceParticipantRequest {
  sequenceID: string;
  participantID: string;
  reason?: string;
}

export interface ResumeSequenceParticipantRequest {
  sequenceID: string;
  participantID: string;
}

export interface BulkSequenceOperationRequest {
  sequenceID: string;
  participantIDs: string[];
  operation: BulkSequenceOperationType;
  reason?: string;
}

export interface DuplicateSequenceRequest {
  sequenceID: string;
  newName: string;
  includeParticipants?: boolean;
}

export interface TestSequenceRequest {
  sequenceID: string;
  testRecipientEmail: string;
  mockData?: Record<string, any>;
}
