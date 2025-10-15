export interface EmailMessage {
  id: string;
  messageID: string;
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  sentAt: Date;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status?: string;
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
  participantName: string;
  participantEmail: string;
  lastMessageFrom: string;
  lastMessageEmail: string;
  lastMessagePreview: string;
  emailMessages?: EmailMessage[];
  generatedResponses?: GeneratedEmailResponse[];
}

export interface EmailThreadDetail extends ClientEmailThread {
  messages: EmailMessage[];
}

export interface GetThreadsParams {
  limit?: number;
  status?: string;
  clientID?: string;
  isRead?: boolean;
  priority?: string;
  search?: string;
}

export interface ReplyToThreadParams {
  subject: string;
  text?: string;
  html?: string;
}

export interface UpdateThreadParams {
  isRead?: boolean;
  status?: string;
  priority?: string;
}

export interface ClientEmailSyncResult {
  success: boolean;
  message: string;
  syncedAccounts?: number;
}

export interface EmailSyncStats {
  unreadThreads: number;
  totalThreadsToday: number;
  lastSyncAt: Date | null;
}
