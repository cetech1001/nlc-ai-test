import {
  EmailConditionOperator,
  EmailConditionType,
  EmailSequenceStatus,
  EmailSequenceTriggerType,
  EmailSequenceType, SequenceParticipantType
} from "./enums";

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
  emails: SequenceEmail[];
  status: EmailSequenceStatus;
  isActive: boolean;
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  createdAt: string;
  updatedAt: string;
}

export interface SequenceAnalytics {
  sequenceID: string;
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
  averageEngagement: number;
  emailPerformance: Array<{
    emailIndex: number;
    sent: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  }>;
  conversionMetrics?: {
    conversions: number;
    conversionRate: number;
    revenue?: number;
  };
}
