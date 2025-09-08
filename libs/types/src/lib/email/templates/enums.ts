export enum EmailTemplateCategory {
  WELCOME = 'welcome',
  FOLLOW_UP = 'follow_up',
  NURTURE = 'nurture',
  ONBOARDING = 'onboarding',
  PROMOTIONAL = 'promotional',
  TRANSACTIONAL = 'transactional',
  REMINDER = 'reminder',
  FEEDBACK = 'feedback',
  COURSE_RELATED = 'course_related',
  CUSTOM = 'custom'
}

export enum EmailTemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived'
}

export enum EmailTemplateType {
  STANDARD = 'standard',
  AI_GENERATED = 'ai_generated',
  SYSTEM = 'system'
}
