import { BaseEvent } from '@nlc-ai/api-messaging';

export interface EmailSyncEvent extends BaseEvent{
  eventType: string;
  schemaVersion: number;
  payload: EmailSyncPayload;
}

export interface EmailSyncPayload {
  coachID: string;
  totalProcessed: number;
  clientEmailsFound: number;
  syncedAt: string;
}

export interface ClientEmailReceivedEvent extends BaseEvent{
  eventType: 'email.client.received';
  schemaVersion: number;
  payload: {
    coachID: string;
    clientID: string;
    threadID: string;
    emailID: string;
    subject: string;
    receivedAt: string;
  };
}

export const EMAIL_SYNC_ROUTING_KEYS = {
  SYNC_COMPLETED: 'email.sync.completed',
  CLIENT_EMAIL_RECEIVED: 'email.client.received',
  RESPONSE_GENERATED: 'client.email.response.generated',
} as const;

export interface IntegrationConnectedEvent extends BaseEvent {
  eventType: 'integration.connected';
  payload: {
    integrationID: string;
    userID: string;
    userType: string;
    platformName: string;
    integrationType: string;
    connectedAt: string;
  };
}

export interface IntegrationDisconnectedEvent extends BaseEvent {
  eventType: 'integration.disconnected';
  payload: {
    integrationID: string;
    userID: string;
    userType: string;
    platformName: string;
    integrationType: string;
    disconnectedAt: string;
  };
}

export interface IntegrationSyncCompletedEvent extends BaseEvent {
  eventType: 'integration.sync.completed';
  payload: {
    integrationID: string;
    userID: string;
    userType: string;
    platformName: string;
    syncData: any;
    syncedAt: string;
  };
}

export interface IntegrationSyncFailedEvent extends BaseEvent {
  eventType: 'integration.sync.failed';
  payload: {
    integrationID: string;
    userID: string;
    userType: string;
    platformName: string;
    error: string;
    failedAt: string;
  };
}

export interface EmailAccountConnectedEvent extends BaseEvent {
  eventType: 'email.account.connected';
  payload: {
    accountID: string;
    userID: string;
    userType: string;
    emailAddress: string;
    provider: string;
    isPrimary: boolean;
    connectedAt: string;
  };
}

export interface EmailAccountDisconnectedEvent extends BaseEvent {
  eventType: 'email.account.disconnected';
  payload: {
    accountID: string;
    userID: string;
    userType: string;
    emailAddress: string;
    provider: string;
    disconnectedAt: string;
  };
}

export interface EmailAccountSyncCompletedEvent extends BaseEvent {
  eventType: 'email.account.sync.completed';
  payload: {
    accountID: string;
    userID: string;
    userType: string;
    emailAddress: string;
    syncStats: {
      threadsCount: number;
      messagesCount: number;
    };
    syncedAt: string;
  };
}

export type IntegrationEvent =
  | IntegrationConnectedEvent
  | IntegrationDisconnectedEvent
  | IntegrationSyncCompletedEvent
  | IntegrationSyncFailedEvent
  | EmailAccountConnectedEvent
  | EmailAccountDisconnectedEvent
  | EmailAccountSyncCompletedEvent;

export const INTEGRATION_ROUTING_KEYS = {
  CONNECTED: 'integration.connected',
  DISCONNECTED: 'integration.disconnected',
  SYNC_COMPLETED: 'integration.sync.completed',
  SYNC_FAILED: 'integration.sync.failed',
  EMAIL_CONNECTED: 'email.account.connected',
  EMAIL_DISCONNECTED: 'email.account.disconnected',
  EMAIL_SYNC_COMPLETED: 'email.account.sync.completed',
} as const;
