import { QueryParams } from '../../query-params';
import {
  EmailThreadStatus,
  EmailThreadPriority,
  EmailMessageStatus,
  EmailIntentCategory
} from './enums';
import { EmailAttachment } from './common';

export interface GetEmailThreadsRequest extends QueryParams {
  coachID?: string;
  clientID?: string;
  leadID?: string;
  status?: EmailThreadStatus;
  priority?: EmailThreadPriority;
  isRead?: boolean;
  tags?: string[];
  hasAttachments?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface GetEmailThreadRequest {
  threadID: string;
  includeMessages?: boolean;
  includeAnalytics?: boolean;
  includeSuggestions?: boolean;
}

export interface SendEmailRequest {
  threadID?: string;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  text?: string;
  html?: string;
  templateID?: string;
  templateVariables?: Record<string, any>;
  attachments?: EmailAttachment[];
  scheduleFor?: string;
  priority?: EmailThreadPriority;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ReplyToEmailRequest {
  threadID: string;
  messageID: string;
  text?: string;
  html?: string;
  templateID?: string;
  templateVariables?: Record<string, any>;
  attachments?: EmailAttachment[];
  scheduleFor?: string;
  replyToAll?: boolean;
}

export interface UpdateEmailThreadRequest {
  status?: EmailThreadStatus;
  priority?: EmailThreadPriority;
  isRead?: boolean;
  tags?: string[];
  clientID?: string;
  leadID?: string;
}

export interface BulkUpdateThreadsRequest {
  threadIDs: string[];
  updates: {
    status?: EmailThreadStatus;
    priority?: EmailThreadPriority;
    isRead?: boolean;
    tags?: string[];
  };
}

export interface ArchiveThreadsRequest {
  threadIDs: string[];
  reason?: string;
}

export interface SearchEmailsRequest extends QueryParams {
  coachID?: string;
  query: string;
  threadIDs?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  includeAttachments?: boolean;
  messageStatus?: EmailMessageStatus;
  intentCategory?: EmailIntentCategory;
}

export interface GetAISuggestionsRequest {
  threadID: string;
  messageID?: string;
  context?: 'reply' | 'new_message' | 'follow_up';
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  maxSuggestions?: number;
}

export interface ApproveAIResponseRequest {
  threadID: string;
  responseID: string;
  modifications?: {
    subject?: string;
    body?: string;
  };
  scheduleFor?: string;
}
