import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import {MediaProviderType} from "@nlc-ai/api-types";

export class MediaConfigSchema {
  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  DATABASE_SCHEMA?: string = 'media';

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
  SERVICE_NAME?: string = 'media-service';

  @IsOptional()
  @IsString()
  SERVICE_VERSION?: string = '1.0.0';

  @IsOptional()
  @IsString()
  NODE_ENV?: string = 'development';

  // Media Provider Configuration
  @IsEnum(MediaProviderType)
  MEDIA_PROVIDER: MediaProviderType = MediaProviderType.CLOUDINARY;

  // Cloudinary Configuration
  @IsOptional()
  @IsString()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_API_KEY?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_API_SECRET?: string;

  // Upload Limits
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  MAX_FILE_SIZE?: number = 100 * 1024 * 1024; // 100MB

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  MAX_VIDEO_SIZE?: number = 500 * 1024 * 1024; // 500MB

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ENABLE_TRANSFORMATIONS?: boolean = true;

  @IsOptional()
  @IsString()
  DEFAULT_FOLDER?: string = 'uploads';
}
