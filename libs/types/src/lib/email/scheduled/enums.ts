export enum ScheduledEmailStatus {
  SCHEDULED = 'scheduled',
  PROCESSING = 'processing',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

export enum ScheduledEmailType {
  ONE_TIME = 'one_time',
  SEQUENCE = 'sequence',
  RECURRING = 'recurring',
  FOLLOW_UP = 'follow_up',
  REMINDER = 'reminder'
}

export enum EmailProvider {
  SENDGRID = 'sendgrid',
  MAILGUN = 'mailgun',
  SES = 'ses',
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
  CUSTOM = 'custom'
}

export enum RecurringPattern {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}
