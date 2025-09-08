export enum EmailThreadStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
  SPAM = 'spam',
  TRASH = 'trash'
}

export enum EmailThreadPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum EmailMessageStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  PROCESSING = 'processing',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  SIMULATED = 'simulated'
}

export enum EmailIntentCategory {
  QUESTION = 'question',
  REQUEST = 'request',
  COMPLAINT = 'complaint',
  COMPLIMENT = 'compliment',
  BOOKING = 'booking',
  CANCELLATION = 'cancellation',
  PAYMENT = 'payment',
  SUPPORT = 'support',
  GENERAL = 'general',
  URGENT = 'urgent'
}

export enum EmailSentimentScore {
  VERY_NEGATIVE = 'very_negative',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  POSITIVE = 'positive',
  VERY_POSITIVE = 'very_positive'
}
