export interface EventConfig {
  critical: boolean;
  expectedConsumers?: string[];
  description?: string;
}

export const EVENT_CONFIGS: Record<string, EventConfig> = {
  'auth.verification.requested': {
    critical: true,
    expectedConsumers: ['email-service'],
    description: 'Email verification code sent to user',
  },
  'auth.coach.registered': {
    critical: true,
    expectedConsumers: ['email-service'],
    description: 'New coach registration',
  },
  'auth.coach.verified': {
    critical: true,
    expectedConsumers: ['email-service'],
    description: 'Coach email verification completed',
  },
  'auth.password.reset': {
    critical: true,
    expectedConsumers: ['email-service'],
    description: 'Password reset requested',
  },
  'auth.client.invited': {
    critical: true,
    expectedConsumers: ['email-service'],
    description: 'Client invitation sent',
  },
  'analytics.page.viewed': {
    critical: false,
    expectedConsumers: ['analytics-service'],
    description: 'Page view tracking',
  },
  'analytics.feature.used': {
    critical: false,
    expectedConsumers: ['analytics-service'],
    description: 'Feature usage tracking',
  },
};

export function isEventCritical(routingKey: string): boolean {
  const config = EVENT_CONFIGS[routingKey];
  return config?.critical ?? true;
}
