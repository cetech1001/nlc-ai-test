export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  SCHEDULED = 'scheduled',
  PROCESSING = 'processing',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

export enum EmailType {
  VERIFICATION = 'verification',
  PASSWORD_RESET = 'password-reset',
  WELCOME = 'welcome',
  LEAD_FOLLOWUP = 'lead-followup',
  CLIENT_RESPONSE = 'client-response',
  PAYMENT_REQUEST = 'payment-request',
  SEQUENCE_COMPLETE = 'sequence-complete'
}

export enum EmailProvider {
  MAILGUN = 'mailgun',
  SENDGRID = 'sendgrid',
  POSTMARK = 'postmark'
}
