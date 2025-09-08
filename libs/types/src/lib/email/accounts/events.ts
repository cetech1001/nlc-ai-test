import {BaseEvent} from "@nlc-ai/api-messaging";

export interface EmailAccountConnectedEvent extends BaseEvent {
  eventType: 'email.account.connected';
  payload: {
    accountID: string;
    userID: string;
    userType: 'coach' | 'admin' | 'client';
    emailAddress: string;
    provider: string;
    connectedAt: string;
  };
}

export interface EmailAccountDisconnectedEvent extends BaseEvent {
  eventType: 'email.account.disconnected';
  payload: {
    accountID: string;
    userID: string;
    userType: 'coach' | 'admin' | 'client';
    emailAddress: string;
    reason: string;
    disconnectedAt: string;
  };
}

export interface EmailAccountSyncStartedEvent extends BaseEvent {
  eventType: 'email.account.sync.started';
  payload: {
    accountID: string;
    userID: string;
    userType: 'coach' | 'admin' | 'client';
    syncType: 'manual' | 'scheduled' | 'automatic';
    startedAt: string;
  };
}

export interface EmailAccountSyncCompletedEvent extends BaseEvent {
  eventType: 'email.account.sync.completed';
  payload: {
    accountID: string;
    userID: string;
    userType: 'coach' | 'admin' | 'client';
    emailsProcessed: number;
    newEmails: number;
    errorCount: number;
    completedAt: string;
    duration: number;
  };
}

export interface EmailAccountSyncFailedEvent extends BaseEvent {
  eventType: 'email.account.sync.failed';
  payload: {
    accountID: string;
    userID: string;
    userType: 'coach' | 'admin' | 'client';
    error: string;
    consecutiveFailures: number;
    failedAt: string;
  };
}

export interface EmailAccountEventPayloads {
  'email.account.connected': EmailAccountConnectedEvent['payload'];
  'email.account.disconnected': EmailAccountDisconnectedEvent['payload'];
  'email.account.sync.started': EmailAccountSyncStartedEvent['payload'];
  'email.account.sync.completed': EmailAccountSyncCompletedEvent['payload'];
  'email.account.sync.failed': EmailAccountSyncFailedEvent['payload'];
}

export type EmailAccountEvent =
  | EmailAccountConnectedEvent
  | EmailAccountDisconnectedEvent
  | EmailAccountSyncStartedEvent
  | EmailAccountSyncCompletedEvent
  | EmailAccountSyncFailedEvent;

export const EMAIL_ACCOUNT_ROUTING_KEYS = {
  ACCOUNT_CONNECTED: 'email.account.connected',
  ACCOUNT_DISCONNECTED: 'email.account.disconnected',
  ACCOUNT_SYNC_STARTED: 'email.account.sync.started',
  ACCOUNT_SYNC_COMPLETED: 'email.account.sync.completed',
  ACCOUNT_SYNC_FAILED: 'email.account.sync.failed',
};
