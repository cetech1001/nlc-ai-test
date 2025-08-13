import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsUrl, IsOptional, validateSync } from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

class BillingConfigSchema {
  // Stripe Configuration
  @IsString()
  STRIPE_SECRET_KEY: string;

  @IsString()
  STRIPE_WEBHOOK_SECRET: string;

  @IsOptional()
  @IsString()
  STRIPE_PUBLISHABLE_KEY?: string;

  // Database Configuration
  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  DATABASE_SCHEMA?: string = 'billing';

  // RabbitMQ Configuration
  @IsString()
  RABBITMQ_URL: string;

  @IsOptional()
  @IsString()
  RABBITMQ_EXCHANGE?: string = 'nlc.domain.events';

  // JWT Configuration
  @IsString()
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string = '24h';

  // Service Configuration
  @IsOptional()
  @IsString()
  SERVICE_NAME?: string = 'billing-service';

  @IsOptional()
  @IsString()
  SERVICE_VERSION?: string = '1.0.0';

  @IsOptional()
  @IsString()
  NODE_ENV?: string = 'development';

  // External URLs
  @IsOptional()
  @IsUrl()
  COACH_PLATFORM_URL?: string;

  @IsOptional()
  @IsUrl()
  ADMIN_PLATFORM_URL?: string;

  // Email Configuration
  @IsOptional()
  @IsString()
  MAILGUN_API_KEY?: string;

  @IsOptional()
  @IsString()
  MAILGUN_DOMAIN?: string;

  // Performance Settings
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  MAX_RETRIES?: number = 3;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  OUTBOX_BATCH_SIZE?: number = 100;
}

function validateConfig(config: Record<string, unknown>) {
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

export default registerAs('billing', () => {
  const config = validateConfig(process.env);

  return {
    stripe: {
      secretKey: config.STRIPE_SECRET_KEY,
      webhookSecret: config.STRIPE_WEBHOOK_SECRET,
      publicKey: config.STRIPE_PUBLISHABLE_KEY,
    },
    database: {
      url: config.DATABASE_URL,
      schema: config.DATABASE_SCHEMA,
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
      version: config.SERVICE_VERSION,
      environment: config.NODE_ENV,
    },
    urls: {
      coachPlatform: config.COACH_PLATFORM_URL,
      adminPlatform: config.ADMIN_PLATFORM_URL,
    },
    email: {
      mailgunApiKey: config.MAILGUN_API_KEY,
      mailgunDomain: config.MAILGUN_DOMAIN,
    },
    performance: {
      maxRetries: config.MAX_RETRIES,
      outboxBatchSize: config.OUTBOX_BATCH_SIZE,
    },
  };
});
