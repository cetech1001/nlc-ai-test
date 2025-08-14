import {BaseEvent} from "@nlc-ai/api-messaging";
import {UserType} from "./user.types";

export interface AuthCoachRegisteredEvent extends BaseEvent {
  eventType: 'auth.coach.registered';
  payload: {
    coachID: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface AuthCoachLoginEvent extends BaseEvent {
  eventType: 'auth.coach.login';
  payload: {
    coachID: string;
    email: string;
    loginAt: string;
  };
}

export interface AuthCoachVerifiedEvent extends BaseEvent {
  eventType: 'auth.coach.verified';
  payload: {
    coachID: string;
    email: string;
    verifiedAt: string;
  };
}

export interface AuthVerificationRequestedEvent extends BaseEvent {
  eventType: 'auth.verification.requested';
  payload: {
    email: string;
    code: string;
    type: 'email_verification' | 'password_reset';
  };
}

export interface AuthAdminLoginEvent extends BaseEvent {
  eventType: 'auth.admin.login';
  payload: {
    adminID: string;
    email: string;
    role: string | null;
    loginAt: string;
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
    provider?: 'google';
  };
}

export interface AuthClientLoginEvent extends BaseEvent {
  eventType: 'auth.client.login';
  payload: {
    clientID: string;
    coachID: string;
    email: string;
    loginAt: string;
  };
}

export interface AuthProfileUpdatedEvent extends BaseEvent {
  eventType: 'auth.coach.profile.updated' | 'auth.admin.profile.updated' | 'auth.client.profile.updated';
  payload: {
    userID: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string | null; // For admin
  };
}

export interface AuthPasswordUpdatedEvent extends BaseEvent {
  eventType: 'auth.password.updated';
  payload: {
    userID: string;
    userType: UserType;
    updatedAt: string;
  };
}

export interface AuthPasswordResetEvent extends BaseEvent {
  eventType: 'auth.password.reset';
  payload: {
    email: string;
    userType: UserType;
    resetAt: string;
  };
}

export interface AuthAvatarUpdatedEvent extends BaseEvent {
  eventType: 'auth.avatar.updated';
  payload: {
    userID: string;
    userType: UserType;
    avatarUrl: string;
  };
}

export interface AuthClientInvitedEvent extends BaseEvent {
  eventType: 'auth.client.invited';
  payload: {
    inviteID: string;
    coachID: string;
    email: string;
    coachName: string;
    businessName?: string;
    token: string;
    message?: string;
    expiresAt: string;
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

export interface AuthClientCoachContextSwitchedEvent extends BaseEvent {
  eventType: 'auth.client.coach.context.switched';
  payload: {
    clientID: string;
    previousCoachID?: string;
    newCoachID: string;
    clientEmail: string;
    newCoachName: string;
    newCoachBusinessName?: string | null;
    switchedAt: string;
  };
}

export interface AuthClientRelationshipUpdatedEvent extends BaseEvent {
  eventType: 'auth.client.relationship.updated';
  payload: {
    relationshipID: string;
    clientID: string;
    coachID: string;
    changes: Record<string, any>;
    updatedBy: string;
  };
}

export interface AuthClientRelationshipRemovedEvent extends BaseEvent {
  eventType: 'auth.client.relationship.removed';
  payload: {
    relationshipID: string;
    clientID: string;
    coachID: string;
    removedBy: string;
  };
}

export type AuthEvent =
  | AuthCoachRegisteredEvent
  | AuthCoachLoginEvent
  | AuthCoachVerifiedEvent
  | AuthVerificationRequestedEvent
  | AuthAdminLoginEvent
  | AuthClientRegisteredEvent
  | AuthClientLoginEvent
  | AuthClientInvitedEvent
  | AuthClientConnectedEvent
  | AuthClientRelationshipUpdatedEvent
  | AuthClientRelationshipRemovedEvent
  | AuthClientCoachContextSwitchedEvent
  | AuthProfileUpdatedEvent
  | AuthPasswordUpdatedEvent
  | AuthPasswordResetEvent
  | AuthAvatarUpdatedEvent;
