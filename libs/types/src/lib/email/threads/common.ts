import {
  EmailIntentCategory,
  EmailMessageStatus,
  EmailSentimentScore,
  EmailThreadPriority,
  EmailThreadStatus
} from "./enums";

export interface EmailMessage {
  id: string;
  threadID: string;
  emailTemplateID?: string;
  providerMessageID?: string;
  to: string;
  from: string;
  subject?: string;
  text?: string;
  html?: string;
  cc?: string;
  bcc?: string;
  attachments?: EmailAttachment[];
  aiProcessed: boolean;
  tags?: string[];
  sentimentScore?: number;
  intentCategory?: EmailIntentCategory;
  suggestedActions: string[];
  status: EmailMessageStatus;
  errorMessage?: string;
  metadata?: Record<string, any>;
  openedAt?: string;
  clickedAt?: string;
  sentAt: string;
  receivedAt?: string;
  createdAt: string;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
  size?: number;
}

export interface EmailThread {
  id: string;
  coachID: string;
  clientID?: string;
  leadID?: string;
  emailAccountID: string;
  threadID: string;
  subject?: string;
  participants: string[];
  status: EmailThreadStatus;
  isRead: boolean;
  priority: EmailThreadPriority;
  messageCount: number;
  tags: string[];
  lastMessageAt?: string;
  lastMessage?: EmailMessage;
  generatedResponses: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ThreadAnalytics {
  threadID: string;
  totalMessages: number;
  responseTime: {
    average: number;
    fastest: number;
    slowest: number;
  };
  sentimentTrend: Array<{
    messageID: string;
    sentiment: number;
    timestamp: string;
  }>;
  engagementMetrics: {
    opens: number;
    clicks: number;
    replies: number;
  };
}

export interface EmailAISuggestions {
  threadID: string;
  messageID: string;
  suggestedResponses: Array<{
    id: string;
    response: string;
    confidence: number;
    reasoning: string;
    tone: string;
  }>;
  suggestedActions: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
  }>;
  intentAnalysis: {
    primary: EmailIntentCategory;
    confidence: number;
    secondary?: EmailIntentCategory;
  };
  sentimentAnalysis: {
    score: number;
    label: EmailSentimentScore;
    confidence: number;
  };
}
