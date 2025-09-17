import {ClientEmailResponse} from "@nlc-ai/sdk-agents";

export interface ClientEmailThread {
  id: string;
  coachID: string;
  clientID: string;
  emailAccountID: string;
  threadID: string; // External provider thread ID
  subject: string;
  status: 'active' | 'archived' | 'closed';
  isRead: boolean;
  priority: 'low' | 'normal' | 'high';
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status?: string;
  };
  emailMessages?: {
    id: string;
    from: string;
    subject: string;
    text: string;
    sentAt: Date;
  }[];
  generatedResponses?: ClientEmailResponse[];
}

export interface EmailMessage {
  id: string;
  threadID: string;
  providerMessageID: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  sentAt: Date;
  receivedAt: Date;
  senderEmail?: string;
  senderName?: string;
  bodyText?: string;
}

export interface EmailThreadDetail extends ClientEmailThread {
  emailMessages: EmailMessage[];
  emailAccount: {
    id: string;
    emailAddress: string;
    provider: string;
  };
}

export interface ClientEmailSyncResult {
  totalProcessed: number;
  clientEmailsFound: number;
  responsesGenerated?: number;
  errors: string[];
  syncedAt: Date;
}
