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

export default registerAs('gateway', () => {
  const config = validateConfig(process.env);

  return {
    service: {
      name: config.SERVICE_NAME,
      version: config.SERVICE_VERSION,
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
        timeout: config.REQUEST_TIMEOUT,
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
      community: {
        url: config.COMMUNITY_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      analytics: {
        url: config.ANALYTICS_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      agents: {
        url: config.AGENTS_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      messaging: {
        url: config.MESSAGING_SERVICE_URL,
        timeout: config.REQUEST_TIMEOUT,
      },
      course: {
        url: config.COURSE_SERVICE_URL,
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
    monitoring: {
      enableMetrics: config.ENABLE_METRICS,
      enableTracing: config.ENABLE_TRACING,
    },
  };
});
