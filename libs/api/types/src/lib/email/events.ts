import { BaseEvent } from '@nlc-ai/api-messaging';

// Core Email Events
export interface EmailSentEvent extends BaseEvent {
  eventType: 'email.sent';
  payload: {
    emailID: string;
    to: string;
    subject: string;
    templateID?: string;
    providerMessageID: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
    sentAt: string;
  };
}

export interface EmailFailedEvent extends BaseEvent {
  eventType: 'email.failed';
  payload: {
    emailID: string;
    to: string;
    subject: string;
    error: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
    failedAt: string;
  };
}

export interface EmailOpenedEvent extends BaseEvent {
  eventType: 'email.opened';
  payload: {
    messageID: string;
    recipientEmail: string;
    openedAt: string;
    userAgent?: string;
    ipAddress?: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
  };
}

export interface EmailClickedEvent extends BaseEvent {
  eventType: 'email.clicked';
  payload: {
    messageID: string;
    recipientEmail: string;
    clickedUrl: string;
    clickedAt: string;
    userAgent?: string;
    ipAddress?: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
  };
}

export interface EmailBouncedEvent extends BaseEvent {
  eventType: 'email.bounced';
  payload: {
    messageID: string;
    recipientEmail: string;
    reason: string;
    bounceType: 'hard' | 'soft';
    bouncedAt: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
  };
}

export interface EmailComplainedEvent extends BaseEvent {
  eventType: 'email.complained';
  payload: {
    messageID: string;
    recipientEmail: string;
    complainedAt: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
  };
}

export interface EmailUnsubscribedEvent extends BaseEvent {
  eventType: 'email.unsubscribed';
  payload: {
    messageID: string;
    recipientEmail: string;
    unsubscribedAt: string;
    coachID?: string;
    leadID?: string;
    clientID?: string;
  };
}

// Scheduled Email Events
export interface ScheduledEmailSentEvent extends BaseEvent {
  eventType: 'email.scheduled.sent';
  payload: {
    scheduledEmailID: string;
    providerMessageID: string;
    recipientEmail: string;
    coachID: string;
    leadID?: string;
    clientID?: string;
    sequenceOrder?: number;
    emailSequenceID?: string;
    sentAt: string;
  };
}

export interface ScheduledEmailFailedEvent extends BaseEvent {
  eventType: 'email.scheduled.failed';
  payload: {
    scheduledEmailID: string;
    recipientEmail: string;
    coachID: string;
    leadID?: string;
    clientID?: string;
    error: string;
    retryCount: number;
    failedAt: string;
  };
}

export interface ScheduledEmailCancelledEvent extends BaseEvent {
  eventType: 'email.scheduled.cancelled';
  payload: {
    scheduledEmailID: string;
    recipientEmail: string;
    coachID: string;
    leadID?: string;
    clientID?: string;
    reason: string;
    cancelledAt: string;
  };
}

// Email Sequence Events
export interface EmailSequenceStartedEvent extends BaseEvent {
  eventType: 'email.sequence.started';
  payload: {
    sequenceID: string;
    leadID: string;
    coachID: string;
    sequenceType: string;
    totalEmails: number;
    startedAt: string;
  };
}

export interface EmailSequenceCompletedEvent extends BaseEvent {
  eventType: 'email.sequence.completed';
  payload: {
    sequenceID: string;
    leadID: string;
    coachID: string;
    totalEmailsSent: number;
    completedAt: string;
    conversionStatus?: 'converted' | 'not_converted';
  };
}

export interface EmailSequencePausedEvent extends BaseEvent {
  eventType: 'email.sequence.paused';
  payload: {
    sequenceID: string;
    leadID?: string;
    clientID?: string;
    coachID: string;
    reason: string;
    pausedEmailsCount: number;
    pausedAt: string;
  };
}

export interface EmailSequenceResumedEvent extends BaseEvent {
  eventType: 'email.sequence.resumed';
  payload: {
    sequenceID: string;
    leadID?: string;
    clientID?: string;
    coachID: string;
    resumedEmailsCount: number;
    resumedAt: string;
  };
}

// Template Events
export interface EmailTemplateCreatedEvent extends BaseEvent {
  eventType: 'email.template.created';
  payload: {
    templateID: string;
    coachID: string;
    templateName: string;
    category: string;
    isAiGenerated: boolean;
    createdAt: string;
  };
}

export interface EmailTemplateUsedEvent extends BaseEvent {
  eventType: 'email.template.used';
  payload: {
    templateID: string;
    coachID: string;
    templateName: string;
    usageCount: number;
    usedAt: string;
    emailID?: string;
    recipientType: 'lead' | 'client';
  };
}

export interface EmailTemplateUpdatedEvent extends BaseEvent {
  eventType: 'email.template.updated';
  payload: {
    templateID: string;
    coachID: string;
    templateName: string;
    changes: Record<string, any>;
    updatedAt: string;
  };
}

export interface ClientEmailResponseApprovedEvent extends BaseEvent {
  eventType: 'email.client.response.approved';
  payload: {
    responseID: string;
    threadID: string;
    clientID: string;
    coachID: string;
    approvedAt: string;
    sentAt?: string;
    wasModified: boolean;
  };
}

export interface ClientEmailResponseRejectedEvent extends BaseEvent {
  eventType: 'email.client.response.rejected';
  payload: {
    responseID: string;
    threadID: string;
    clientID: string;
    coachID: string;
    rejectedAt: string;
    reason?: string;
  };
}

// System Events
export interface EmailSystemHealthEvent extends BaseEvent {
  eventType: 'email.system.health';
  payload: {
    isHealthy: boolean;
    pendingEmails: number;
    processingEmails: number;
    failureRate: number;
    lastProcessedAt?: string;
    issues: string[];
    timestamp: string;
  };
}

export interface EmailEmergencyPausedEvent extends BaseEvent {
  eventType: 'email.emergency.paused';
  payload: {
    coachID: string;
    reason: string;
    pausedCount: number;
    pausedAt: string;
    pausedBy?: string;
  };
}

export interface EmailEmergencyResumedEvent extends BaseEvent {
  eventType: 'email.emergency.resumed';
  payload: {
    coachID: string;
    resumedCount: number;
    resumedAt: string;
    resumedBy?: string;
  };
}

// Bulk Operation Events
export interface EmailBulkOperationStartedEvent extends BaseEvent {
  eventType: 'email.bulk.operation.started';
  payload: {
    operationID: string;
    operationType: 'send' | 'template_update' | 'cleanup';
    coachID?: string;
    itemCount: number;
    startedAt: string;
  };
}

export interface EmailBulkOperationCompletedEvent extends BaseEvent {
  eventType: 'email.bulk.operation.completed';
  payload: {
    operationID: string;
    operationType: 'send' | 'template_update' | 'cleanup';
    coachID?: string;
    successCount: number;
    failureCount: number;
    completedAt: string;
    duration: number; // milliseconds
  };
}

// Deliverability Events
export interface EmailDeliverabilityAnalyzedEvent extends BaseEvent {
  eventType: 'email.deliverability.analyzed';
  payload: {
    emailID: string;
    coachID: string;
    overallScore: number;
    spamScore: number;
    contentScore: number;
    subjectScore: number;
    recommendations: string[];
    analyzedAt: string;
  };
}

export interface EmailSuppressionListUpdatedEvent extends BaseEvent {
  eventType: 'email.suppression.updated';
  payload: {
    email: string;
    action: 'added' | 'removed';
    reason: 'bounce' | 'complaint' | 'unsubscribe' | 'manual';
    coachID?: string;
    updatedAt: string;
  };
}

// Performance Events
export interface EmailPerformanceReportGeneratedEvent extends BaseEvent {
  eventType: 'email.performance.report.generated';
  payload: {
    reportID: string;
    coachID?: string;
    period: {
      start: string;
      end: string;
    };
    metrics: {
      totalSent: number;
      openRate: number;
      clickRate: number;
      bounceRate: number;
    };
    generatedAt: string;
  };
}

// Union type for all email events
export type EmailEvent =
  | EmailSentEvent
  | EmailFailedEvent
  | EmailOpenedEvent
  | EmailClickedEvent
  | EmailBouncedEvent
  | EmailComplainedEvent
  | EmailUnsubscribedEvent
  | ScheduledEmailSentEvent
  | ScheduledEmailFailedEvent
  | ScheduledEmailCancelledEvent
  | EmailSequenceStartedEvent
  | EmailSequenceCompletedEvent
  | EmailSequencePausedEvent
  | EmailSequenceResumedEvent
  | EmailTemplateCreatedEvent
  | EmailTemplateUsedEvent
  | EmailTemplateUpdatedEvent
  // | ClientEmailResponseGeneratedEvent
  | ClientEmailResponseApprovedEvent
  | ClientEmailResponseRejectedEvent
  | EmailSystemHealthEvent
  | EmailEmergencyPausedEvent
  | EmailEmergencyResumedEvent
  | EmailBulkOperationStartedEvent
  | EmailBulkOperationCompletedEvent
  | EmailDeliverabilityAnalyzedEvent
  | EmailSuppressionListUpdatedEvent
  | EmailPerformanceReportGeneratedEvent;

// Event payload interfaces for easier typing
export interface EmailEventPayloads {
  'email.sent': EmailSentEvent['payload'];
  'email.failed': EmailFailedEvent['payload'];
  'email.opened': EmailOpenedEvent['payload'];
  'email.clicked': EmailClickedEvent['payload'];
  'email.bounced': EmailBouncedEvent['payload'];
  'email.complained': EmailComplainedEvent['payload'];
  'email.unsubscribed': EmailUnsubscribedEvent['payload'];
  'email.scheduled.sent': ScheduledEmailSentEvent['payload'];
  'email.scheduled.failed': ScheduledEmailFailedEvent['payload'];
  'email.scheduled.cancelled': ScheduledEmailCancelledEvent['payload'];
  'email.sequence.started': EmailSequenceStartedEvent['payload'];
  'email.sequence.completed': EmailSequenceCompletedEvent['payload'];
  'email.sequence.paused': EmailSequencePausedEvent['payload'];
  'email.sequence.resumed': EmailSequenceResumedEvent['payload'];
  'email.template.created': EmailTemplateCreatedEvent['payload'];
  'email.template.used': EmailTemplateUsedEvent['payload'];
  'email.template.updated': EmailTemplateUpdatedEvent['payload'];
  // 'email.client.response.generated': ClientEmailResponseGeneratedEvent['payload'];
  'email.client.response.approved': ClientEmailResponseApprovedEvent['payload'];
  'email.client.response.rejected': ClientEmailResponseRejectedEvent['payload'];
  'email.system.health': EmailSystemHealthEvent['payload'];
  'email.emergency.paused': EmailEmergencyPausedEvent['payload'];
  'email.emergency.resumed': EmailEmergencyResumedEvent['payload'];
  'email.bulk.operation.started': EmailBulkOperationStartedEvent['payload'];
  'email.bulk.operation.completed': EmailBulkOperationCompletedEvent['payload'];
  'email.deliverability.analyzed': EmailDeliverabilityAnalyzedEvent['payload'];
  'email.suppression.updated': EmailSuppressionListUpdatedEvent['payload'];
  'email.performance.report.generated': EmailPerformanceReportGeneratedEvent['payload'];
}

// Helper type for event emission
export type EmailEventType = keyof EmailEventPayloads;

// Constants for routing keys
export const EMAIL_ROUTING_KEYS = {
  SENT: 'email.sent',
  FAILED: 'email.failed',
  OPENED: 'email.opened',
  CLICKED: 'email.clicked',
  BOUNCED: 'email.bounced',
  COMPLAINED: 'email.complained',
  UNSUBSCRIBED: 'email.unsubscribed',
  SCHEDULED_SENT: 'email.scheduled.sent',
  SCHEDULED_FAILED: 'email.scheduled.failed',
  SCHEDULED_CANCELLED: 'email.scheduled.cancelled',
  SEQUENCE_STARTED: 'email.sequence.started',
  SEQUENCE_COMPLETED: 'email.sequence.completed',
  SEQUENCE_PAUSED: 'email.sequence.paused',
  SEQUENCE_RESUMED: 'email.sequence.resumed',
  TEMPLATE_CREATED: 'email.template.created',
  TEMPLATE_USED: 'email.template.used',
  TEMPLATE_UPDATED: 'email.template.updated',
  CLIENT_RESPONSE_GENERATED: 'email.client.response.generated',
  CLIENT_RESPONSE_APPROVED: 'email.client.response.approved',
  CLIENT_RESPONSE_REJECTED: 'email.client.response.rejected',
  SYSTEM_HEALTH: 'email.system.health',
  EMERGENCY_PAUSED: 'email.emergency.paused',
  EMERGENCY_RESUMED: 'email.emergency.resumed',
  BULK_OPERATION_STARTED: 'email.bulk.operation.started',
  BULK_OPERATION_COMPLETED: 'email.bulk.operation.completed',
  DELIVERABILITY_ANALYZED: 'email.deliverability.analyzed',
  SUPPRESSION_UPDATED: 'email.suppression.updated',
  PERFORMANCE_REPORT_GENERATED: 'email.performance.report.generated',
} as const;
