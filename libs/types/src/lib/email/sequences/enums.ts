export enum EmailSequenceStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DRAFT = 'draft'
}

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

export enum EmailSequenceTriggerType {
  MANUAL = 'manual',
  LEAD_CREATED = 'lead_created',
  CLIENT_REGISTERED = 'client_registered',
  COURSE_ENROLLED = 'course_enrolled',
  FORM_SUBMITTED = 'form_submitted',
  TAG_ADDED = 'tag_added',
  BEHAVIOR = 'behavior',
  DATE_BASED = 'date_based'
}

export enum EmailSequenceType {
  NURTURE = 'nurture',
  ONBOARDING = 'onboarding',
  SALES = 'sales',
  FOLLOW_UP = 'follow_up',
  EDUCATIONAL = 'educational',
  PROMOTIONAL = 'promotional',
  REACTIVATION = 'reactivation',
  CUSTOM = 'custom'
}

export enum SequenceEmailStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  SKIPPED = 'skipped'
}

export enum EmailConditionType {
  TAG = 'tag',
  BEHAVIOR = 'behavior',
  CUSTOM_FIELD = 'custom_field',
  ENGAGEMENT = 'engagement',
}

export enum EmailConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than'
}

export enum SequenceParticipantType {
  CLIENT = 'client',
  COACH = 'coach',
  LEAD = 'lead'
}

export enum BulkSequenceOperationType {
  PAUSE = 'pause',
  RESUME = 'resume',
  REMOVE = 'remove'
}

export enum TestSequenceStatus {
  SENT = 'sent',
  FAILED = 'failed'
}
