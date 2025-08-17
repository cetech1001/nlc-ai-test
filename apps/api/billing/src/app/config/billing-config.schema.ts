import {IsNumber, IsOptional, IsString} from "class-validator";
import {Transform} from "class-transformer";

export class BillingConfigSchema {
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
  @IsString()
  COACH_PLATFORM_URL?: string;

  @IsOptional()
  @IsString()
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
