import { BaseEvent } from '../base-event';

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

export type IntegrationEvent =
  | IntegrationConnectedEvent
  | IntegrationDisconnectedEvent
  | IntegrationSyncCompletedEvent
  | IntegrationSyncFailedEvent;

export const INTEGRATION_ROUTING_KEYS = {
  CONNECTED: 'integration.connected',
  DISCONNECTED: 'integration.disconnected',
  SYNC_COMPLETED: 'integration.sync.completed',
  SYNC_FAILED: 'integration.sync.failed',
} as const;
