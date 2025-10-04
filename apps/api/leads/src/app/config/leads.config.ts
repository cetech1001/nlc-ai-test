import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { registerAs } from '@nestjs/config';
import { LeadsConfigSchema } from './leads-config.schema';

const validateConfig = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(LeadsConfigSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Leads configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
};

export default registerAs('leads', () => {
  const config = validateConfig(process.env);

  return {
    database: {
      url: config.DATABASE_URL,
    },
    rabbitmq: {
      url: config.RABBITMQ_URL,
      exchange: config.RABBITMQ_EXCHANGE,
    },
    service: {
      name: config.SERVICE_NAME,
    },
  };
});
