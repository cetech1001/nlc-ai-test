import {IsOptional, IsString} from "class-validator";

export class BillingConfigSchema {
  @IsString()
  STRIPE_SECRET_KEY: string;

  @IsString()
  STRIPE_WEBHOOK_SECRET: string;

  @IsString()
  STRIPE_PUBLISHABLE_KEY: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  RABBITMQ_URL: string;

  @IsString()
  RABBITMQ_EXCHANGE: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsString()
  NODE_ENV: string;

  @IsString()
  COACH_PLATFORM_URL: string;

  @IsString()
  ADMIN_PLATFORM_URL: string;

  @IsOptional()
  @IsString()
  SERVICE_NAME?: string = 'billing';
}
