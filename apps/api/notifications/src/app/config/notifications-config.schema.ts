import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class NotificationsConfigSchema {
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
  SERVICE_NAME?: string = 'notifications-service';

  // Email Service Integration
  @IsOptional()
  @IsString()
  EMAIL_SERVICE_URL?: string = 'http://localhost:3002';

  @IsOptional()
  @IsString()
  EMAIL_SERVICE_TOKEN?: string;

  // Push Notifications
  @IsOptional()
  @IsString()
  FIREBASE_PROJECT_ID?: string;

  @IsOptional()
  @IsString()
  FIREBASE_PRIVATE_KEY?: string;

  @IsOptional()
  @IsString()
  FIREBASE_CLIENT_EMAIL?: string;

  // Performance Settings
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  NOTIFICATION_BATCH_SIZE?: number = 100;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  NOTIFICATION_RETENTION_DAYS?: number = 30;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  MAX_RETRIES?: number = 3;
}
