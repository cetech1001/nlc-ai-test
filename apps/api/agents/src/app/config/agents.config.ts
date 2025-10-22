import { registerAs } from '@nestjs/config';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AgentsConfigSchema } from './agents-config.schema';

function validateConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(AgentsConfigSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Agents configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
}

export const agentsConfig = registerAs('agents', () => {
  const config = validateConfig(process.env);

  return {
    database: {
      url: config.DATABASE_URL,
    },
    rabbitmq: {
      url: config.RABBITMQ_URL,
      exchange: config.RABBITMQ_EXCHANGE,
    },
    jwt: {
      secret: config.JWT_SECRET,
      expiresIn: config.JWT_EXPIRES_IN,
    },
    service: {
      name: config.SERVICE_NAME,
      environment: config.NODE_ENV,
    },
    services: {
      email: {
        url: config.EMAIL_SERVICE_URL,
      },
    },
    performance: {
      maxRetries: config.MAX_RETRIES,
      cacheTTL: config.CACHE_TTL,
    },
    openai: {
      apiKey: config.OPENAI_API_KEY,
    }
  };
});
