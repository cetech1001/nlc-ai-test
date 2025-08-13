import {IsNumber, IsOptional, IsString} from "class-validator";
import {Transform} from "class-transformer";

export class AuthConfigSchema {
  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  DATABASE_SCHEMA?: string = 'auth';

  @IsString()
  RABBITMQ_URL: string;

  @IsOptional()
  @IsString()
  RABBITMQ_EXCHANGE?: string = 'nlc.domain.events';

  @IsString()
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string = '24h';

  @IsOptional()
  @IsString()
  SERVICE_NAME?: string = 'auth-service';

  @IsOptional()
  @IsString()
  SERVICE_VERSION?: string = '1.0.0';

  @IsOptional()
  @IsString()
  NODE_ENV?: string = 'development';

  // Google OAuth
  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_SECRET?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CALLBACK_URL?: string;

  // Cloudinary for avatars
  @IsOptional()
  @IsString()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_API_KEY?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_API_SECRET?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  MAX_RETRIES?: number = 3;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  OUTBOX_BATCH_SIZE?: number = 100;
}
