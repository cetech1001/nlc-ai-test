export interface CreateSequenceRequest {
  leadID: string;
  coachID?: string; // Optional - will be set from auth if coach role
  sequenceConfig: {
    emailCount: number; // Number of emails in sequence (1-10)
    timings?: string[]; // Optional custom timings ["immediate", "2-days", "1-week"]
    customInstructions?: string; // Optional instructions for AI
    sequenceType?: 'standard' | 'aggressive' | 'nurturing' | 'minimal';
  };
}

export interface UpdateSequenceRequest {
  sequenceID: string;
  updates: {
    description?: string;
    isActive?: boolean;
    emailCount?: number; // Can add/remove emails
    timings?: string[]; // Update timings
  };
}

export interface EmailInSequence {
  id: string;
  sequenceID: string;
  sequenceOrder: number;
  subject: string;
  body: string;
  timing: string;
  scheduledFor: Date;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled' | 'paused';
  sentAt?: Date;
  deliverabilityScore?: number;
  isEdited: boolean; // Track if coach manually edited
  originalAIVersion?: string; // Keep original for comparison
}

export interface UpdateEmailRequest {
  emailID: string;
  updates: {
    subject?: string;
    body?: string;
    scheduledFor?: string; // ISO date string
    timing?: string;
  };
}

export interface EmailSequenceWithEmails {
  id: string;
  leadID: string;
  coachID: string;
  status: string;
  description: string;
  isActive: boolean;
  totalEmails: number;
  emailsSent: number;
  emailsPending: number;
  createdAt: Date;
  updatedAt: Date;
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  };
  emails: EmailInSequence[];
}

export interface RegenerateEmailsRequest {
  sequenceID: string;
  emailOrders: number[]; // Which emails to regenerate [1, 3, 4]
  customInstructions?: string;
}
