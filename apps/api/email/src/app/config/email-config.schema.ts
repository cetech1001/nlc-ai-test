import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class EmailConfigSchema {
  @IsString()
  APP_NAME: string;

  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  DATABASE_SCHEMA?: string = 'comms';

  @IsString()
  RABBITMQ_URL: string;

  @IsOptional()
  @IsString()
  RABBITMQ_EXCHANGE?: string = 'nlc.domain.events';

  @IsOptional()
  @IsString()
  SERVICE_NAME?: string = 'email-service';

  @IsOptional()
  @IsString()
  MAILGUN_API_KEY?: string;

  @IsOptional()
  @IsString()
  MAILGUN_DOMAIN?: string;

  @IsOptional()
  @IsString()
  MAILGUN_URL?: string = 'https://api.mailgun.net';

  @IsOptional()
  @IsString()
  FROM_EMAIL?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  EMAIL_BATCH_SIZE?: number = 50;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  EMAIL_RETENTION_DAYS?: number = 90;

  @IsString()
  AUTH_SERVICE_URL: string;

  @IsString()
  COACH_PLATFORM_URL: string;

  @IsString()
  CLIENT_PLATFORM_URL: string;

  @IsOptional()
  @IsString()
  MAILGUN_WEBHOOK_SIGNING_KEY?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_SECRET?: string;

  @IsOptional()
  @IsString()
  MICROSOFT_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  MICROSOFT_CLIENT_SECRET?: string;

  @IsString()
  REDIS_HOST: string;

  @IsString()
  REDIS_PORT: string;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  REDIS_DB: string;
}
