import {
  EmailConditionOperator,
  EmailConditionType,
  EmailSequenceStatus,
  EmailSequenceTriggerType,
  EmailSequenceType, SequenceParticipantType
} from "./enums";
import {EmailMessage, EmailParticipantType} from "../threads";

export interface SequenceEmail {
  id: string;
  templateID?: string;
  subject: string;
  body: string;
  delayDays: number;
  delayHours?: number;
  orderIndex: number;
  conditions?: EmailCondition[];
  isActive: boolean;
}

export interface EmailCondition {
  type: EmailConditionType;
  field: string;
  operator: EmailConditionOperator;
  value: any;
}

export interface SequenceParticipant {
  id: string;
  sequenceID: string;
  participantID: string;
  participantType: SequenceParticipantType;
  currentEmailIndex: number;
  status: EmailSequenceStatus;
  startedAt: string;
  completedAt?: string;
  pausedAt?: string;
  lastEmailSentAt?: string;
  nextEmailDue?: string;
  emailsCompleted: number;
  totalEmails: number;
}

export interface EmailSequence {
  id: string;
  coachID: string;
  name: string;
  description?: string;
  type: EmailSequenceType;
  triggerType: EmailSequenceTriggerType;
  triggerConditions?: EmailCondition[];
  targetID: string;
  targetType: EmailParticipantType;
  emailMessages: EmailMessage[];
  status: EmailSequenceStatus;
  isActive: boolean;
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  createdAt: string;
  updatedAt: string;
}
