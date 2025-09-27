import { registerAs } from '@nestjs/config';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {BillingConfigSchema} from "./billing-config.schema";

const validateConfig = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(BillingConfigSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
}

export const billingConfig = registerAs('billing', () => {
  const config = validateConfig(process.env);

  return {
    stripe: {
      secretKey: config.STRIPE_SECRET_KEY,
      webhookSecret: config.STRIPE_WEBHOOK_SECRET,
      publicKey: config.STRIPE_PUBLISHABLE_KEY,
    },
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
    urls: {
      coachPlatform: config.COACH_PLATFORM_URL,
      adminPlatform: config.ADMIN_PLATFORM_URL,
    },
  };
});
