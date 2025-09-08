import {
  EmailThread,
  EmailMessage,
  ThreadAnalytics,
  EmailAISuggestions
} from './common';
import {EmailMessageStatus} from "./enums";

export interface GetEmailThreadsResponse {
  threads: EmailThread[];
  total: number;
  hasMore: boolean;
  summary: {
    unread: number;
    high_priority: number;
    needs_response: number;
  };
}

export interface GetEmailThreadResponse {
  thread: EmailThread;
  messages: EmailMessage[];
  analytics?: ThreadAnalytics;
  suggestions?: EmailAISuggestions;
}

export interface SendEmailResponse {
  messageID: string;
  threadID: string;
  providerMessageID?: string;
  status: EmailMessageStatus;
  scheduledFor?: string;
  success: boolean;
  message: string;
}

export interface ReplyToEmailResponse {
  messageID: string;
  threadID: string;
  providerMessageID?: string;
  status: EmailMessageStatus;
  scheduledFor?: string;
  success: boolean;
  message: string;
}

export interface UpdateEmailThreadResponse {
  thread: EmailThread;
  success: boolean;
  message: string;
}

export interface BulkUpdateThreadsResponse {
  updatedCount: number;
  failedCount: number;
  errors: Array<{
    threadID: string;
    error: string;
  }>;
  success: boolean;
  message: string;
}

export interface ArchiveThreadsResponse {
  archivedCount: number;
  failedCount: number;
  errors: Array<{
    threadID: string;
    error: string;
  }>;
  success: boolean;
  message: string;
}

export interface SearchEmailsResponse {
  results: Array<{
    thread: EmailThread;
    message: EmailMessage;
    highlights: {
      subject?: string[];
      content?: string[];
    };
    relevanceScore: number;
  }>;
  total: number;
  hasMore: boolean;
  searchTime: number;
}

export interface GetAISuggestionsResponse {
  suggestions: EmailAISuggestions;
  processingTime: number;
  success: boolean;
}

export interface ApproveAIResponseResponse {
  messageID: string;
  threadID: string;
  status: EmailMessageStatus;
  scheduledFor?: string;
  modifications: {
    subject?: string;
    body?: string;
  };
  success: boolean;
  message: string;
}

export interface GetThreadAnalyticsResponse {
  analytics: ThreadAnalytics;
  trends: Array<{
    date: string;
    messageCount: number;
    avgResponseTime: number;
    sentimentScore: number;
  }>;
}

export interface DeleteEmailThreadResponse {
  success: boolean;
  message: string;
  messagesDeleted: number;
}
