import { registerAs } from '@nestjs/config';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {AuthConfigSchema} from "./auth-config.schema";

function validateConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(AuthConfigSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Auth configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
}

export const authConfig = registerAs('auth', () => {
  const config = validateConfig(process.env);

  return {
    database: {
      url: config.DATABASE_URL,
    },
    redis: {
      url: config.REDIS_URL,
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
      env: config.NODE_ENV,
    },
    google: {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
    },
    tokens: {
      public: config.PUBLIC_TOKEN_NAME,
    }
  };
});
