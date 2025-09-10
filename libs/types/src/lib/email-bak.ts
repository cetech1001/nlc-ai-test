import {Coach} from "./coach";
import {Client} from "./client";

export interface EmailAccount {
  id: string;
  coachID: string;
  emailAddress: string;
  provider: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  isPrimary?: boolean | null;
  isActive?: boolean | null;
  syncEnabled?: boolean | null;
  lastSyncAt: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  coach?: Coach;
  emailThreads?: EmailThread[];
}

export interface EmailMessage {
  id: string;
  threadID: string;
  messageID: string;
  senderEmail: string;
  recipientEmails: string[];
  ccEmails: string[];
  bccEmails: string[];
  subject?: string | null;
  bodyText?: string | null;
  bodyHtml?: string | null;
  attachments?: any | null;
  aiProcessed?: boolean | null;
  sentimentScore?: number | null;
  intentCategory?: string | null;
  suggestedActions?: any | null;
  sentAt: Date;
  receivedAt?: Date | null;
  createdAt?: Date | null;
  emailThread?: EmailThread;
}

export interface EmailTemplate {
  id: string;
  coachID: string;
  name: string;
  category?: string | null;
  subjectTemplate?: string | null;
  bodyTemplate: string;
  isAiGenerated?: boolean | null;
  generationPrompt?: string | null;
  usageCount?: number | null;
  lastUsedAt?: Date | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  coach?: Coach;
}

export interface EmailThread {
  id: string;
  coachID: string;
  clientID?: string | null;
  emailAccountID: string;
  threadID: string;
  subject?: string | null;
  participants: string[];
  status?: string | null;
  isRead?: boolean | null;
  priority?: string | null;
  messageCount?: number | null;
  lastMessageAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  emailMessages?: EmailMessage[];
  client?: Client | null;
  coach?: Coach;
  emailAccount?: EmailAccount;
}

export interface EmailItem {
  id: string;
  title: string;
  recipient: {
    name: string;
    email: string;
    avatar?: string;
  };
  date: string;
  time: string;
  preview: string;
  status: 'pending' | 'approved';
}
