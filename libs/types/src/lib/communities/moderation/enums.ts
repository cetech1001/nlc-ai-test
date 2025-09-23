export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REMOVED = 'removed',
  DISMISSED = 'dismissed',
}

export enum ModerationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ViolationType {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE = 'inappropriate',
  HATE_SPEECH = 'hate_speech',
  MISINFORMATION = 'misinformation',
  COPYRIGHT = 'copyright',
}

export enum ModerationActionType {
  CONTENT_APPROVED = 'content_approved',
  CONTENT_REMOVED = 'content_removed',
  CONTENT_DISMISSED = 'content_dismissed',
  MEMBER_WARNED = 'member_warned',
  MEMBER_SUSPENDED = 'member_suspended',
  MEMBER_BANNED = 'member_banned',
  AUTO_FLAGGED = 'auto_flagged',
  USER_REPORTED = 'user_reported',
}
