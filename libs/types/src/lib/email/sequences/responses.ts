import {
  EmailSequence,
  SequenceParticipant,
} from './common';
import {TestSequenceStatus} from "./enums";
import {SequenceAnalytics} from "../../analytics";

export interface CreateEmailSequenceResponse {
  sequence: EmailSequence;
  message: string;
}

export interface GetEmailSequenceResponse {
  sequence: EmailSequence;
  participants: SequenceParticipant[];
  analytics: SequenceAnalytics;
}

export interface GetEmailSequencesResponse {
  sequences: EmailSequence[];
  total: number;
  hasMore: boolean;
}

export interface UpdateEmailSequenceResponse {
  sequence: EmailSequence;
  message: string;
}

export interface AddParticipantResponse {
  participant: SequenceParticipant;
  nextEmailScheduled?: string;
  message: string;
}

export interface RemoveParticipantResponse {
  message: string;
  cancelledEmails?: number;
}

export interface BulkSequenceOperationResponse {
  processedCount: number;
  failedCount: number;
  errors: Array<{
    participantID: string;
    error: string;
  }>;
  message: string;
}

export interface GetSequenceParticipantsResponse {
  participants: SequenceParticipant[];
  total: number;
  hasMore: boolean;
  analytics: {
    totalActive: number;
    totalCompleted: number;
    totalPaused: number;
    averageCompletionTime: number;
  };
}

export interface DuplicateSequenceResponse {
  sequence: EmailSequence;
  message: string;
}

export interface TestSequenceResponse {
  emailsSent: number;
  testResults: Array<{
    emailIndex: number;
    subject: string;
    status: TestSequenceStatus;
    error?: string;
  }>;
  message: string;
}

export interface DeleteEmailSequenceResponse {
  message: string;
  affectedParticipants: number;
  cancelledEmails: number;
}
