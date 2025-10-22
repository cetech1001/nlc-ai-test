import { registerAs } from '@nestjs/config';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GatewayConfigSchema } from './gateway-config.schema';

function validateConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(GatewayConfigSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Gateway configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
}

export const gatewayConfig = registerAs('gateway', () => {
  const config = validateConfig(process.env);

  return {
    service: {
      name: config.SERVICE_NAME,
      environment: config.NODE_ENV,
    },
    jwt: {
      secret: config.JWT_SECRET,
      expiresIn: config.JWT_EXPIRES_IN,
    },
    services: {
      auth: {
        url: config.AUTH_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      users: {
        url: config.USERS_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      media: {
        url: config.MEDIA_SERVICE_URL,
        timeout: 900000,
      },
      email: {
        url: config.EMAIL_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      billing: {
        url: config.BILLING_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      leads: {
        url: config.LEADS_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      notifications: {
        url: config.NOTIFICATIONS_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      integrations: {
        url: config.INTEGRATIONS_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      communities: {
        url: config.COMMUNITIES_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      analytics: {
        url: config.ANALYTICS_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      agents: {
        url: config.AGENTS_SERVICE_URL,
        timeout: 300000,
      },
      messages: {
        url: config.MESSAGES_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      courses: {
        url: config.COURSES_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      content: {
        url: config.CONTENT_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
    },
    rateLimit: {
      ttl: config.RATE_LIMIT_TTL,
      limit: config.RATE_LIMIT_MAX,
    },
    cors: {
      origins: config.CORS_ORIGINS,
      credentials: config.CORS_CREDENTIALS,
    },
    cache: {
      redis: {
        url: config.REDIS_URL,
      },
      ttl: config.CACHE_TTL,
    },
    circuitBreaker: {
      failureThreshold: config.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
      timeout: config.CIRCUIT_BREAKER_TIMEOUT,
    },
  };
});
