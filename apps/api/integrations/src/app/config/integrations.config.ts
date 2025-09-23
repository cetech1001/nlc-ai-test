import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { registerAs } from '@nestjs/config';
import { IntegrationsConfigSchema } from './integrations-config.schema';

const validateConfig = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(IntegrationsConfigSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Integrations configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
};

export const integrationsConfig = registerAs('integrations', () => {
  const config = validateConfig(process.env);

  return {
    baseUrl: config.API_BASE_URL,
    database: {
      url: config.DATABASE_URL,
    },
    rabbitmq: {
      url: config.RABBITMQ_URL,
      exchange: config.RABBITMQ_EXCHANGE,
    },
    service: {
      name: config.SERVICE_NAME,
      baseUrl: config.API_BASE_URL,
    },
    auth: {
      jwtSecret: config.JWT_SECRET,
      encryptionKey: config.ENCRYPTION_KEY,
    },
    oauth: {
      google: {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
      },
      microsoft: {
        clientID: config.MICROSOFT_CLIENT_ID,
        clientSecret: config.MICROSOFT_CLIENT_SECRET,
      },
      meta: {
        clientID: config.META_CLIENT_ID,
        clientSecret: config.META_CLIENT_SECRET,
      },
      instagram: {
        clientID: config.INSTAGRAM_CLIENT_ID,
        clientSecret: config.INSTAGRAM_CLIENT_SECRET,
      },
      twitter: {
        clientID: config.TWITTER_CLIENT_ID,
        clientSecret: config.TWITTER_CLIENT_SECRET,
      },
      tiktok: {
        clientID: config.TIKTOK_CLIENT_ID,
        clientSecret: config.TIKTOK_CLIENT_SECRET,
      },
      calendly: {
        clientID: config.CALENDLY_CLIENT_ID,
        clientSecret: config.CALENDLY_CLIENT_SECRET,
      },
    },
    tokens: {
      refreshBufferMs: config.TOKEN_REFRESH_BUFFER_MS,
    },
  };
});
