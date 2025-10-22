import { registerAs } from '@nestjs/config';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { MessagesConfigSchema } from './messages-config.schema';

function validateConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(MessagesConfigSchema, config, {
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

export default registerAs('messaging', () => {
  const config = validateConfig(process.env);

  return {
    database: {
      url: config.DATABASE_URL,
    },
    service: {
      name: config.SERVICE_NAME,
      environment: config.NODE_ENV,
    }
  };
});
