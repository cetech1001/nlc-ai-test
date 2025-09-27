// libs/api/types/src/lib/users/events/users-service.events.ts
import { BaseEvent } from '@nlc-ai/api-messaging';
import {
  AuthAvatarUpdatedEvent,
  AuthClientConnectedEvent,
  AuthClientRegisteredEvent,
  AuthCoachRegisteredEvent,
  AuthCoachVerifiedEvent, AuthProfileUpdatedEvent
} from "../auth";

// =============================================================================
// AUTH EVENTS (Emitted from auth events handler)
// =============================================================================

/*export interface AuthCoachRegisteredEvent extends BaseEvent {
  eventType: 'auth.coach.registered';
  payload: {
    coachID: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface AuthCoachVerifiedEvent extends BaseEvent {
  eventType: 'auth.coach.verified';
  payload: {
    coachID: string;
    email: string;
  };
}

export interface AuthClientRegisteredEvent extends BaseEvent {
  eventType: 'auth.client.registered';
  payload: {
    clientID: string;
    coachID: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface AuthClientConnectedEvent extends BaseEvent {
  eventType: 'auth.client.connected';
  payload: {
    relationshipID: string;
    clientID: string;
    coachID: string;
    email: string;
    connectedBy: string;
  };
}

export interface AuthProfileUpdatedEvent extends BaseEvent {
  eventType: 'auth.profile.updated';
  payload: {
    userID: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface AuthAvatarUpdatedEvent extends BaseEvent {
  eventType: 'auth.avatar.updated';
  payload: {
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    avatarUrl: string;
  };
}*/

// =============================================================================
// CLIENT RELATIONSHIP EVENTS (From client-coach.service.ts)
// =============================================================================

export interface ClientRelationshipConnectedEvent extends BaseEvent {
  eventType: 'auth.client.connected';
  payload: {
    relationshipID: string;
    clientID: string;
    coachID: string;
    email: string;
    connectedBy: string;
  };
}

export interface ClientRelationshipUpdatedEvent extends BaseEvent {
  eventType: 'auth.client.relationship.updated';
  payload: {
    relationshipID: string;
    clientID: string;
    coachID: string;
    changes: Record<string, any>;
    updatedBy: string;
  };
}

export interface ClientRelationshipRemovedEvent extends BaseEvent {
  eventType: 'auth.client.relationship.removed';
  payload: {
    relationshipID: string;
    clientID: string;
    coachID: string;
    removedBy: string;
  };
}

// =============================================================================
// CLIENT INVITATION EVENTS (From invites.service.ts)
// =============================================================================

export interface ClientInvitedEvent extends BaseEvent {
  eventType: 'auth.client.invited';
  payload: {
    inviteID: string;
    coachID: string;
    email: string;
    coachName: string;
    businessName?: string | null;
    token: string;
    message?: string | null;
    expiresAt: string; // ISO string
  };
}

export interface ClientInviteResendEvent extends BaseEvent {
  eventType: 'auth.client.invited'; // Same as initial invite
  payload: {
    inviteID: string;
    coachID: string;
    email: string;
    coachName: string;
    businessName?: string;
    token: string;
    message?: string;
    expiresAt: string; // ISO string
  };
}

// =============================================================================
// USER MANAGEMENT EVENTS (Potential future events from services)
// =============================================================================

export interface UserCreatedEvent extends BaseEvent {
  eventType: 'user.created';
  payload: {
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    email: string;
    firstName: string;
    lastName: string;
    createdBy?: string;
    createdAt: string; // ISO string
  };
}

export interface UserUpdatedEvent extends BaseEvent {
  eventType: 'user.updated';
  payload: {
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    changes: Record<string, any>;
    updatedBy?: string;
    updatedAt: string; // ISO string
  };
}

export interface UserStatusToggledEvent extends BaseEvent {
  eventType: 'user.status.toggled';
  payload: {
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    previousStatus: boolean;
    newStatus: boolean;
    toggledBy?: string;
    toggledAt: string; // ISO string
  };
}

export interface UserDeletedEvent extends BaseEvent {
  eventType: 'user.deleted';
  payload: {
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    email: string;
    deletedBy?: string;
    deletedAt: string; // ISO string
    softDelete: boolean;
  };
}

export interface UserRestoredEvent extends BaseEvent {
  eventType: 'user.restored';
  payload: {
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    email: string;
    restoredBy?: string;
    restoredAt: string; // ISO string
  };
}

// =============================================================================
// COACH-SPECIFIC EVENTS
// =============================================================================

export interface CoachStatusToggledEvent extends BaseEvent {
  eventType: 'coach.status.toggled';
  payload: {
    coachID: string;
    email: string;
    previousStatus: boolean;
    newStatus: boolean;
    toggledBy?: string;
    toggledAt: string; // ISO string
  };
}

export interface CoachRestoredEvent extends BaseEvent {
  eventType: 'coach.restored';
  payload: {
    coachID: string;
    email: string;
    restoredBy?: string;
    restoredAt: string; // ISO string
  };
}

export interface CoachDeletedEvent extends BaseEvent {
  eventType: 'coach.deleted';
  payload: {
    coachID: string;
    email: string;
    deletedBy?: string;
    deletedAt: string; // ISO string
  };
}

// =============================================================================
// ADMIN EVENTS
// =============================================================================

export interface AdminCreatedEvent extends BaseEvent {
  eventType: 'admin.created';
  payload: {
    adminID: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    createdBy?: string;
    createdAt: string; // ISO string
  };
}

export interface AdminUpdatedEvent extends BaseEvent {
  eventType: 'admin.updated';
  payload: {
    adminID: string;
    email: string;
    changes: Record<string, any>;
    updatedBy?: string;
    updatedAt: string; // ISO string
  };
}

export interface AdminStatusToggledEvent extends BaseEvent {
  eventType: 'admin.status.toggled';
  payload: {
    adminID: string;
    email: string;
    previousStatus: boolean;
    newStatus: boolean;
    toggledBy?: string;
    toggledAt: string; // ISO string
  };
}

export interface AdminDeletedEvent extends BaseEvent {
  eventType: 'admin.deleted';
  payload: {
    adminID: string;
    email: string;
    deletedBy?: string;
    deletedAt: string; // ISO string
  };
}

// =============================================================================
// PROFILE EVENTS
// =============================================================================

export interface ProfileUpdatedEvent extends BaseEvent {
  eventType: 'profile.updated';
  payload: {
    userID: string;
    userType: 'coach' | 'client' | 'admin';
    changes: Record<string, any>;
    updatedBy?: string;
    updatedAt: string; // ISO string
  };
}

// =============================================================================
// ANALYTICS EVENTS
// =============================================================================

export interface AnalyticsReportGeneratedEvent extends BaseEvent {
  eventType: 'analytics.report.generated';
  payload: {
    reportID: string;
    reportType: 'platform' | 'coach' | 'client' | 'detailed';
    targetID?: string; // coachID for coach-specific reports
    period: {
      startDate: string; // ISO string
      endDate: string; // ISO string
    };
    generatedBy?: string;
    generatedAt: string; // ISO string
    metrics?: Record<string, any>;
  };
}

// =============================================================================
// UNION TYPES AND EXPORTS
// =============================================================================

export type UserEvent =
// Auth events
  | AuthCoachRegisteredEvent
  | AuthCoachVerifiedEvent
  | AuthClientRegisteredEvent
  | AuthClientConnectedEvent
  | AuthProfileUpdatedEvent
  | AuthAvatarUpdatedEvent
  // Relationship events
  | ClientRelationshipConnectedEvent
  | ClientRelationshipUpdatedEvent
  | ClientRelationshipRemovedEvent
  // Invitation events
  | ClientInvitedEvent
  | ClientInviteResendEvent
  // User management events
  | UserCreatedEvent
  | UserUpdatedEvent
  | UserStatusToggledEvent
  | UserDeletedEvent
  | UserRestoredEvent
  // Coach events
  | CoachStatusToggledEvent
  | CoachRestoredEvent
  | CoachDeletedEvent
  // Admin events
  | AdminCreatedEvent
  | AdminUpdatedEvent
  | AdminStatusToggledEvent
  | AdminDeletedEvent
  // Profile events
  | ProfileUpdatedEvent
  // Analytics events
  | AnalyticsReportGeneratedEvent;

// Event payload interfaces for easier typing
export interface UsersServiceEventPayloads {
  // Auth events
  'auth.coach.registered': AuthCoachRegisteredEvent['payload'];
  'auth.coach.verified': AuthCoachVerifiedEvent['payload'];
  'auth.client.registered': AuthClientRegisteredEvent['payload'];
  'auth.client.connected': AuthClientConnectedEvent['payload'];
  'auth.profile.updated': AuthProfileUpdatedEvent['payload'];
  'auth.avatar.updated': AuthAvatarUpdatedEvent['payload'];
  // Relationship events
  'auth.client.relationship.updated': ClientRelationshipUpdatedEvent['payload'];
  'auth.client.relationship.removed': ClientRelationshipRemovedEvent['payload'];
  // Invitation events
  'auth.client.invited': ClientInvitedEvent['payload'];
  // User management events
  'user.created': UserCreatedEvent['payload'];
  'user.updated': UserUpdatedEvent['payload'];
  'user.status.toggled': UserStatusToggledEvent['payload'];
  'user.deleted': UserDeletedEvent['payload'];
  'user.restored': UserRestoredEvent['payload'];
  // Coach events
  'coach.status.toggled': CoachStatusToggledEvent['payload'];
  'coach.restored': CoachRestoredEvent['payload'];
  'coach.deleted': CoachDeletedEvent['payload'];
  // Admin events
  'admin.created': AdminCreatedEvent['payload'];
  'admin.updated': AdminUpdatedEvent['payload'];
  'admin.status.toggled': AdminStatusToggledEvent['payload'];
  'admin.deleted': AdminDeletedEvent['payload'];
  // Profile events
  'profile.updated': ProfileUpdatedEvent['payload'];
  // Analytics events
  'analytics.report.generated': AnalyticsReportGeneratedEvent['payload'];
}

// Helper type for event emission
export type UsersServiceEventType = keyof UsersServiceEventPayloads;

// Constants for routing keys used in the users service
export const USERS_SERVICE_ROUTING_KEYS = {
  // Auth events (handled by auth events handler)
  AUTH_COACH_REGISTERED: 'auth.coach.registered',
  AUTH_COACH_VERIFIED: 'auth.coach.verified',
  AUTH_CLIENT_REGISTERED: 'auth.client.registered',
  AUTH_CLIENT_CONNECTED: 'auth.client.connected',
  AUTH_PROFILE_UPDATED: 'auth.profile.updated',
  AUTH_AVATAR_UPDATED: 'auth.avatar.updated',

  // Relationship events (emitted by client-coach service)
  CLIENT_RELATIONSHIP_UPDATED: 'auth.client.relationship.updated',
  CLIENT_RELATIONSHIP_REMOVED: 'auth.client.relationship.removed',

  // Invitation events (emitted by invites service)
  CLIENT_INVITED: 'auth.client.invited',

  // User management events (potential future events)
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_STATUS_TOGGLED: 'user.status.toggled',
  USER_DELETED: 'user.deleted',
  USER_RESTORED: 'user.restored',

  // Coach events
  COACH_STATUS_TOGGLED: 'coach.status.toggled',
  COACH_RESTORED: 'coach.restored',
  COACH_DELETED: 'coach.deleted',

  // Admin events
  ADMIN_CREATED: 'admin.created',
  ADMIN_UPDATED: 'admin.updated',
  ADMIN_STATUS_TOGGLED: 'admin.status.toggled',
  ADMIN_DELETED: 'admin.deleted',

  // Profile events
  PROFILE_UPDATED: 'profile.updated',

  // Analytics events
  ANALYTICS_REPORT_GENERATED: 'analytics.report.generated',
} as const;

// Event subscription patterns for the users service
export const USERS_SERVICE_EVENT_PATTERNS = [
  // Auth service events that users service listens to
  'auth.coach.registered',
  'auth.coach.verified',
  'auth.client.registered',
  'auth.client.connected',
  'auth.profile.updated',
  'auth.avatar.updated',
] as const;
