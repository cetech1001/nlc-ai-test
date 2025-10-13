export const EmailThreadStatus = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;
export type EmailThreadStatus =
  typeof EmailThreadStatus[keyof typeof EmailThreadStatus];

export const EmailThreadPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
} as const;
export type EmailThreadPriority =
  typeof EmailThreadPriority[keyof typeof EmailThreadPriority];

export const EmailParticipantType = {
  COACH: 'coach',
  CLIENT: 'client',
  LEAD: 'lead',
} as const;
export type EmailParticipantType =
  typeof EmailParticipantType[keyof typeof EmailParticipantType];

export const EmailMessageStatus = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  PROCESSING: 'processing',
  SENT: 'sent',
  DELIVERED: 'delivered',
  OPENED: 'opened',
  CLICKED: 'clicked',
  FAILED: 'failed',
  BOUNCED: 'bounced',
  SIMULATED: 'simulated',
} as const;
export type EmailMessageStatus =
  typeof EmailMessageStatus[keyof typeof EmailMessageStatus];

export const EmailIntentCategory = {
  QUESTION: 'question',
  REQUEST: 'request',
  COMPLAINT: 'complaint',
  COMPLIMENT: 'compliment',
  BOOKING: 'booking',
  CANCELLATION: 'cancellation',
  PAYMENT: 'payment',
  SUPPORT: 'support',
  GENERAL: 'general',
  URGENT: 'urgent',
} as const;
export type EmailIntentCategory =
  typeof EmailIntentCategory[keyof typeof EmailIntentCategory];

export const EmailSentimentScore = {
  VERY_NEGATIVE: 'very_negative',
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral',
  POSITIVE: 'positive',
  VERY_POSITIVE: 'very_positive',
} as const;
export type EmailSentimentScore =
  typeof EmailSentimentScore[keyof typeof EmailSentimentScore];
