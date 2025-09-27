import {BaseEvent} from "../base-event";
import {UserType} from "../users";

export interface AuthCoachRegisteredEvent extends BaseEvent {
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

export interface AuthPasswordResetEvent extends BaseEvent {
  eventType: 'auth.password.reset';
  payload: {
    email: string;
    userType: UserType;
    resetAt: string;
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
  | AuthCoachVerifiedEvent
  | AuthVerificationRequestedEvent
  | AuthClientRegisteredEvent
  | AuthClientInvitedEvent
  | AuthClientConnectedEvent
  | AuthClientRelationshipRemovedEvent
  | AuthPasswordResetEvent;
