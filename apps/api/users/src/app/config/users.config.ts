import { registerAs } from '@nestjs/config';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UsersConfigSchema } from './users-config.schema';

function validateConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(UsersConfigSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Users configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
}

export const usersConfig = registerAs('users', () => {
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
      env: config.NODE_ENV,
    },
  };
});
