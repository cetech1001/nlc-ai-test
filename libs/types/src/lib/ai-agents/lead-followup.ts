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
  coachID: string | null;
  status: string;
  description: string | null;
  isActive: boolean;
  totalEmails: number;
  emailsSent: number;
  emailsPending: number;
  createdAt: Date;
  updatedAt: Date;
  lead?: {
    id: string;
    name: string;
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

// libs/types/src/lib/lead.ts
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
  text: string;
  html: string;
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

// Timing options for the frontend
export interface TimingOption {
  value: string;
  label: string;
  description: string;
  category: 'immediate' | 'hours' | 'days' | 'weeks' | 'months';
}

export const TIMING_OPTIONS: TimingOption[] = [
  { value: 'immediate', label: 'Immediate (5 min)', description: 'Send right away', category: 'immediate' },
  { value: '1-hour', label: '1 Hour', description: 'Send in 1 hour', category: 'hours' },
  { value: '3-hours', label: '3 Hours', description: 'Send in 3 hours', category: 'hours' },
  { value: '1-day', label: '1 Day', description: 'Send tomorrow', category: 'days' },
  { value: '2-days', label: '2 Days', description: 'Send in 2 days', category: 'days' },
  { value: '3-days', label: '3 Days', description: 'Send in 3 days', category: 'days' },
  { value: '5-days', label: '5 Days', description: 'Send in 5 days', category: 'days' },
  { value: '1-week', label: '1 Week', description: 'Send in 1 week', category: 'weeks' },
  { value: '10-days', label: '10 Days', description: 'Send in 10 days', category: 'days' },
  { value: '2-weeks', label: '2 Weeks', description: 'Send in 2 weeks', category: 'weeks' },
  { value: '3-weeks', label: '3 Weeks', description: 'Send in 3 weeks', category: 'weeks' },
  { value: '1-month', label: '1 Month', description: 'Send in 1 month', category: 'months' },
  { value: '6-weeks', label: '6 Weeks', description: 'Send in 6 weeks', category: 'weeks' },
  { value: '2-months', label: '2 Months', description: 'Send in 2 months', category: 'months' },
];

export interface SequenceTemplate {
  name: string;
  type: 'standard' | 'aggressive' | 'nurturing' | 'minimal';
  description: string;
  recommendedEmailCount: number;
  defaultTimings: string[];
  useCase: string;
}

export const SEQUENCE_TEMPLATES: SequenceTemplate[] = [
  {
    name: 'Standard Follow-up',
    type: 'standard',
    description: 'Balanced approach with consistent touchpoints',
    recommendedEmailCount: 4,
    defaultTimings: ['immediate', '3-days', '1-week', '2-weeks'],
    useCase: 'Most leads and general follow-up'
  },
  {
    name: 'Aggressive Sales',
    type: 'aggressive',
    description: 'Frequent contact for hot leads who showed strong interest',
    recommendedEmailCount: 6,
    defaultTimings: ['immediate', '1-day', '3-days', '5-days', '1-week', '10-days'],
    useCase: 'Hot leads who requested immediate contact'
  },
  {
    name: 'Nurturing Sequence',
    type: 'nurturing',
    description: 'Gentle, value-focused approach for relationship building',
    recommendedEmailCount: 5,
    defaultTimings: ['immediate', '5-days', '2-weeks', '3-weeks', '1-month'],
    useCase: 'Long-term relationship building and education'
  },
  {
    name: 'Minimal Touch',
    type: 'minimal',
    description: 'Light follow-up for leads who prefer less contact',
    recommendedEmailCount: 3,
    defaultTimings: ['immediate', '1-week', '1-month'],
    useCase: 'Professional leads who prefer minimal outreach'
  }
];
