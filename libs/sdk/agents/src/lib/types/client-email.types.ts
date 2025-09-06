export interface ClientEmailResponse {
  id: string;
  coachID: string;
  threadID: string;
  clientID: string;
  interactionID: string;
  subject: string;
  body: string;
  confidence: number;
  status: 'generated' | 'updated' | 'sent' | 'scheduled' | 'cancelled' | 'superseded' | 'failed';
  metadata?: any;
  createdAt: Date;
  updatedAt?: Date;
  sentAt?: Date;
  scheduledFor?: Date;
  actualSubject?: string;
  actualBody?: string;
  deliverabilityScore?: number;
  thread?: {
    id: string;
    subject: string;
    client: {
      id: string;
      name: string;
      email: string;
    };
  };
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  aiConfidence?: number;
  generatedAt?: Date;
}

export interface ClientEmailStats {
  pendingResponses: number;
  emailsProcessedToday: number;
  emailsProcessedThisWeek: number;
  averageResponseTime: number;
  unreadThreads: number;
  totalThreads: number;
  activeThreads: number;
  responsesSentToday: number;
  responsesSentThisWeek: number;
}

export interface ClientEmailAnalytics {
  totalThreads: number;
  activeThreads: number;
  responseRate: number;
  averageResponseTime: number;
  topClients: Array<{
    clientID: string;
    clientName: string;
    threadCount: number;
    lastMessageAt: Date;
  }>;
  dailyStats: Array<{
    date: string;
    threadsReceived: number;
    responsesSent: number;
  }>;
}

export interface GenerateResponseRequest {
  threadID: string;
  customInstructions?: string;
}

export interface SendResponseRequest {
  responseID: string;
  modifications?: {
    subject?: string;
    body?: string;
  };
}

export interface ScheduleResponseRequest {
  responseID: string;
  scheduledFor: string;
  modifications?: {
    subject?: string;
    body?: string;
  };
}
