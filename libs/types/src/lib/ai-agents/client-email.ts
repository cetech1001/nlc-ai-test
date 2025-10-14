import {Client} from "../client";
import {EmailMessage} from "../email";

export interface ClientEmailResponse {
  id: string;
  threadID: string;
  clientID: string;
  subject: string;
  body: string;
  status: 'pending_approval' | 'approved' | 'sent' | 'failed' | 'cancelled';
  deliverabilityScore: number;
  aiConfidence: number;
  generatedAt: Date;
  scheduledFor: Date | null;
  approvedAt: Date | null;
  sentAt: Date | null;
  originalEmailID: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  };
  thread?: {
    id: string;
    subject: string;
    lastMessageAt: Date;
  };
}

export interface ClientEmailSyncResult {
  totalProcessed: number;
  clientEmailsFound: number;
  responsesGenerated: number;
  errors: string[];
  syncedAt: Date;
}

export interface GeneratedEmailResponse {
  id: string;
  threadID: string;
  subject: string;
  body: string;
  confidence: number;
  status: 'generated' | 'sent' | 'scheduled' | 'failed';
  deliverabilityScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientEmailThread {
  id: string;
  threadID: string;
  subject: string;
  status: 'active' | 'archived' | 'closed';
  priority: 'high' | 'normal' | 'low';
  isRead: boolean;
  lastMessageAt: Date;
  messageCount: number;
  client?: Client;
  emailMessages?: EmailMessage[];
  generatedResponses?: GeneratedEmailResponse[];
}

export interface ClientEmailStats {
  pendingResponses: number;
  emailsProcessedToday: number;
  emailsProcessedThisWeek: number;
  averageResponseTime: number; // in minutes
  clientEmailsFound: number;
  lastSyncAt: Date | null;
}

export interface ClientEmailAnalytics {
  period: string;
  totalThreads: number;
  activeThreads: number;
  totalResponses: number;
  approvedResponses: number;
  rejectedResponses: number;
  approvalRate: number; // percentage
  avgResponseTimeMinutes: number;
  avgDeliverabilityScore: number;
  metrics: {
    threadsPerDay: number;
    responsesPerDay: number;
    activeThreadsPercent: number;
  };
}

export interface EmailThreadDetail {
  thread: {
    id: string;
    subject: string;
    status: string;
    isRead: boolean;
    priority: string;
    messageCount: number;
    lastMessageAt: Date;
    createdAt: Date;
  };
  messages: Array<{
    id: string;
    providerMessageID: string;
    from: string;
    subject: string;
    text: string;
    html?: string;
    sentAt: Date;
    receivedAt: Date;
  }>;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    engagementScore?: number;
    totalInteractions?: number;
    lastInteractionAt?: Date;
    tags?: string[];
  };
  pendingResponse?: ClientEmailResponse;
}

export interface GenerateResponseRequest {
  threadID: string;
  customInstructions?: string;
}

export interface ApproveResponseRequest {
  emailID: string;
  modifications?: {
    subject?: string;
    body?: string;
  };
}

export interface EmailSyncStatus {
  isRunning: boolean;
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  accountsSynced: number;
  totalAccounts: number;
  errors?: string[];
}
