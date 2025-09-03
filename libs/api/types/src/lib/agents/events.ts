// libs/api/types/src/lib/agents/events.ts
import { BaseEvent } from '@nlc-ai/api-messaging';

// =============================================================================
// AI AGENT LIFECYCLE EVENTS
// =============================================================================

export interface AIAgentCreatedEvent extends BaseEvent {
  eventType: 'agent.created';
  payload: {
    agentID: string;
    name: string;
    type: string;
    description?: string;
    createdAt: string; // ISO string
  };
}

export interface AIAgentUpdatedEvent extends BaseEvent {
  eventType: 'agent.updated';
  payload: {
    agentID: string;
    name: string;
    changes: Record<string, any>;
    updatedAt: string; // ISO string
  };
}

export interface AIAgentDeletedEvent extends BaseEvent {
  eventType: 'agent.deleted';
  payload: {
    agentID: string;
    name: string;
    type: string;
    deletedAt: string; // ISO string
  };
}

export interface AIAgentActivatedEvent extends BaseEvent {
  eventType: 'agent.activated';
  payload: {
    agentID: string;
    name: string;
    type: string;
    activatedAt: string; // ISO string
  };
}

export interface AIAgentDeactivatedEvent extends BaseEvent {
  eventType: 'agent.deactivated';
  payload: {
    agentID: string;
    name: string;
    type: string;
    deactivatedAt: string; // ISO string
  };
}

// =============================================================================
// AI INTERACTION EVENTS
// =============================================================================

export interface AIInteractionStartedEvent extends BaseEvent {
  eventType: 'agent.interaction.started';
  payload: {
    interactionID: string;
    agentID: string;
    agentName: string;
    agentType: string;
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    interactionType: string;
    inputTokens?: number;
    startedAt: string; // ISO string
  };
}

export interface AIInteractionCompletedEvent extends BaseEvent {
  eventType: 'agent.interaction.completed';
  payload: {
    interactionID: string;
    agentID: string;
    agentName: string;
    agentType: string;
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    interactionType: string;
    tokensUsed: number;
    processingTimeMs: number;
    confidenceScore?: number;
    completedAt: string; // ISO string
    success: boolean;
  };
}

export interface AIInteractionFailedEvent extends BaseEvent {
  eventType: 'agent.interaction.failed';
  payload: {
    interactionID: string;
    agentID: string;
    agentName: string;
    agentType: string;
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    interactionType: string;
    errorType: string;
    errorMessage: string;
    failedAt: string; // ISO string
  };
}

// =============================================================================
// COURSE STRUCTURE AGENT EVENTS
// =============================================================================

export interface CourseStructureGeneratedEvent extends BaseEvent {
  eventType: 'course.structure.generated';
  payload: {
    interactionID: string;
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    courseTitle: string;
    chaptersCount: number;
    totalLessons: number;
    estimatedTotalHours: number;
    targetAudience: string;
    generatedAt: string; // ISO string
  };
}

export interface CourseStructureRequestedEvent extends BaseEvent {
  eventType: 'course.structure.requested';
  payload: {
    interactionID: string;
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    requestDetails: {
      description: string;
      targetAudience?: string;
      difficultyLevel?: string;
      estimatedDuration?: string;
    };
    requestedAt: string; // ISO string
  };
}

// =============================================================================
// CONTENT GENERATION EVENTS
// =============================================================================

export interface ContentGeneratedEvent extends BaseEvent {
  eventType: 'agent.content.generated';
  payload: {
    interactionID: string;
    agentID: string;
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    contentType: string;
    wordCount: number;
    topic: string;
    generatedAt: string; // ISO string
  };
}

export interface EmailAnalyzedEvent extends BaseEvent {
  eventType: 'agent.email.analyzed';
  payload: {
    interactionID: string;
    agentID: string;
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    sentiment: {
      score: number;
      label: string;
    };
    intent: string;
    urgency: string;
    analyzedAt: string; // ISO string
  };
}

export interface EmailResponseSuggestedEvent extends BaseEvent {
  eventType: 'agent.email.response.suggested';
  payload: {
    interactionID: string;
    agentID: string;
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    responseType: string;
    tone: string;
    wordCount: number;
    suggestedAt: string; // ISO string
  };
}

// =============================================================================
// MARKETING ASSISTANT EVENTS
// =============================================================================

export interface MarketingCampaignSuggestedEvent extends BaseEvent {
  eventType: 'agent.marketing.campaign.suggested';
  payload: {
    interactionID: string;
    agentID: string;
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    campaignName: string;
    channelsCount: number;
    businessType: string;
    suggestedAt: string; // ISO string
  };
}

export interface SocialMediaPostSuggestedEvent extends BaseEvent {
  eventType: 'agent.social.post.suggested';
  payload: {
    interactionID: string;
    agentID: string;
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    platform: string;
    contentType: string;
    hasHashtags: boolean;
    suggestedAt: string; // ISO string
  };
}

// =============================================================================
// COACHING ASSISTANT EVENTS
// =============================================================================

export interface ClientAnalyzedEvent extends BaseEvent {
  eventType: 'agent.client.analyzed';
  payload: {
    interactionID: string;
    agentID: string;
    userID: string; // Coach ID
    clientID: string;
    analysisType: string;
    progressScore: number;
    recommendationsCount: number;
    analyzedAt: string; // ISO string
  };
}

export interface SessionPlanGeneratedEvent extends BaseEvent {
  eventType: 'agent.session.plan.generated';
  payload: {
    interactionID: string;
    agentID: string;
    userID: string; // Coach ID
    clientName: string;
    sessionNumber: number;
    sessionDuration: number;
    activitiesCount: number;
    generatedAt: string; // ISO string
  };
}

// =============================================================================
// AGENT PERFORMANCE EVENTS
// =============================================================================

export interface AgentPerformanceReportGeneratedEvent extends BaseEvent {
  eventType: 'agent.performance.report.generated';
  payload: {
    agentID: string;
    agentName: string;
    period: {
      startDate: string; // ISO string
      endDate: string; // ISO string
    };
    metrics: {
      totalRequests: number;
      successRate: number;
      averageResponseTime: number;
      totalTokensUsed: number;
      uniqueUsers: number;
    };
    generatedAt: string; // ISO string
  };
}

export interface AgentUsageThresholdReachedEvent extends BaseEvent {
  eventType: 'agent.usage.threshold.reached';
  payload: {
    agentID: string;
    agentName: string;
    thresholdType: 'requests' | 'tokens' | 'errors';
    threshold: number;
    currentValue: number;
    period: string; // 'daily' | 'weekly' | 'monthly'
    reachedAt: string; // ISO string
  };
}

export interface AgentErrorRateHighEvent extends BaseEvent {
  eventType: 'agent.error.rate.high';
  payload: {
    agentID: string;
    agentName: string;
    errorRate: number; // percentage
    threshold: number; // percentage
    timeWindow: string; // e.g., 'last_hour', 'last_day'
    totalRequests: number;
    failedRequests: number;
    detectedAt: string; // ISO string
  };
}

// =============================================================================
// UNION TYPES AND EXPORTS
// =============================================================================

export type AgentEvent =
// Lifecycle events
  | AIAgentCreatedEvent
  | AIAgentUpdatedEvent
  | AIAgentDeletedEvent
  | AIAgentActivatedEvent
  | AIAgentDeactivatedEvent
  // Interaction events
  | AIInteractionStartedEvent
  | AIInteractionCompletedEvent
  | AIInteractionFailedEvent
  // Course structure events
  | CourseStructureGeneratedEvent
  | CourseStructureRequestedEvent
  // Content generation events
  | ContentGeneratedEvent
  | EmailAnalyzedEvent
  | EmailResponseSuggestedEvent
  // Marketing events
  | MarketingCampaignSuggestedEvent
  | SocialMediaPostSuggestedEvent
  // Coaching events
  | ClientAnalyzedEvent
  | SessionPlanGeneratedEvent
  // Performance events
  | AgentPerformanceReportGeneratedEvent
  | AgentUsageThresholdReachedEvent
  | AgentErrorRateHighEvent;

// Event payload interfaces for easier typing
export interface AgentsServiceEventPayloads {
  // Lifecycle events
  'agent.created': AIAgentCreatedEvent['payload'];
  'agent.updated': AIAgentUpdatedEvent['payload'];
  'agent.deleted': AIAgentDeletedEvent['payload'];
  'agent.activated': AIAgentActivatedEvent['payload'];
  'agent.deactivated': AIAgentDeactivatedEvent['payload'];
  // Interaction events
  'agent.interaction.started': AIInteractionStartedEvent['payload'];
  'agent.interaction.completed': AIInteractionCompletedEvent['payload'];
  'agent.interaction.failed': AIInteractionFailedEvent['payload'];
  // Course structure events
  'course.structure.generated': CourseStructureGeneratedEvent['payload'];
  'course.structure.requested': CourseStructureRequestedEvent['payload'];
  // Content generation events
  'agent.content.generated': ContentGeneratedEvent['payload'];
  'agent.email.analyzed': EmailAnalyzedEvent['payload'];
  'agent.email.response.suggested': EmailResponseSuggestedEvent['payload'];
  // Marketing events
  'agent.marketing.campaign.suggested': MarketingCampaignSuggestedEvent['payload'];
  'agent.social.post.suggested': SocialMediaPostSuggestedEvent['payload'];
  // Coaching events
  'agent.client.analyzed': ClientAnalyzedEvent['payload'];
  'agent.session.plan.generated': SessionPlanGeneratedEvent['payload'];
  // Performance events
  'agent.performance.report.generated': AgentPerformanceReportGeneratedEvent['payload'];
  'agent.usage.threshold.reached': AgentUsageThresholdReachedEvent['payload'];
  'agent.error.rate.high': AgentErrorRateHighEvent['payload'];
}

// Helper type for event emission
export type AgentsServiceEventType = keyof AgentsServiceEventPayloads;

// Constants for routing keys used in the agents service
export const AGENTS_SERVICE_ROUTING_KEYS = {
  // Lifecycle events
  AGENT_CREATED: 'agent.created',
  AGENT_UPDATED: 'agent.updated',
  AGENT_DELETED: 'agent.deleted',
  AGENT_ACTIVATED: 'agent.activated',
  AGENT_DEACTIVATED: 'agent.deactivated',

  // Interaction events
  AGENT_INTERACTION_STARTED: 'agent.interaction.started',
  AGENT_INTERACTION_COMPLETED: 'agent.interaction.completed',
  AGENT_INTERACTION_FAILED: 'agent.interaction.failed',

  // Course structure events
  COURSE_STRUCTURE_GENERATED: 'course.structure.generated',
  COURSE_STRUCTURE_REQUESTED: 'course.structure.requested',

  // Content generation events
  AGENT_CONTENT_GENERATED: 'agent.content.generated',
  AGENT_EMAIL_ANALYZED: 'agent.email.analyzed',
  AGENT_EMAIL_RESPONSE_SUGGESTED: 'agent.email.response.suggested',

  // Marketing events
  AGENT_MARKETING_CAMPAIGN_SUGGESTED: 'agent.marketing.campaign.suggested',
  AGENT_SOCIAL_POST_SUGGESTED: 'agent.social.post.suggested',

  // Coaching events
  AGENT_CLIENT_ANALYZED: 'agent.client.analyzed',
  AGENT_SESSION_PLAN_GENERATED: 'agent.session.plan.generated',

  // Performance events
  AGENT_PERFORMANCE_REPORT_GENERATED: 'agent.performance.report.generated',
  AGENT_USAGE_THRESHOLD_REACHED: 'agent.usage.threshold.reached',
  AGENT_ERROR_RATE_HIGH: 'agent.error.rate.high',
} as const;

// Event subscription patterns for other services listening to agent events
export const AGENTS_SERVICE_EVENT_PATTERNS = [
  // All agent events
  'agent.*',
  // Specific high-value events
  'course.structure.generated',
  'agent.interaction.completed',
  'agent.content.generated',
  'agent.error.rate.high',
  'agent.usage.threshold.reached',
] as const;
