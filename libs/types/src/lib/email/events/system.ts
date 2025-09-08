import {BaseEvent} from "@nlc-ai/api-messaging";

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

export interface EmailProviderStatusChangedEvent extends BaseEvent {
  eventType: 'email.provider.status.changed';
  payload: {
    provider: string;
    oldStatus: string;
    newStatus: string;
    affectedAccounts: number;
    changedAt: string;
  };
}

export type EmailSystemEvent =
  | EmailSystemHealthEvent
  | EmailEmergencyPausedEvent
  | EmailEmergencyResumedEvent
  | EmailProviderStatusChangedEvent;

export interface EmailSystemEventPayloads {
  'email.system.health': EmailSystemHealthEvent['payload'];
  'email.emergency.paused': EmailEmergencyPausedEvent['payload'];
  'email.emergency.resumed': EmailEmergencyResumedEvent['payload'];
  'email.provider.status.changed': EmailProviderStatusChangedEvent['payload'];
}

export const EMAIL_SYSTEM_ROUTING_KEYS = {
  SYSTEM_HEALTH: 'email.system.health',
  EMERGENCY_PAUSED: 'email.emergency.paused',
  EMERGENCY_RESUMED: 'email.emergency.resumed',
  PROVIDER_STATUS_CHANGED: 'email.provider.status.changed',
};
