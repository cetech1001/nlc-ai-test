import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class EmailConfigSchema {
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

  // Mailgun Configuration
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
}
