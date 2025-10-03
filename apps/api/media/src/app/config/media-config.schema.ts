import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { MediaProviderType } from "@nlc-ai/api-types";

export class MediaConfigSchema {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  RABBITMQ_URL: string;

  @IsOptional()
  RABBITMQ_EXCHANGE: string;

  @IsString()
  JWT_SECRET: string;

  @IsOptional()
  JWT_EXPIRES_IN: string;

  @IsOptional()
  @IsString()
  SERVICE_NAME?: string = 'media';

  @IsOptional()
  NODE_ENV: string;

  @IsEnum(MediaProviderType)
  MEDIA_PROVIDER: MediaProviderType = MediaProviderType.CLOUDINARY;

  @IsEnum(MediaProviderType)
  VIDEO_PROVIDER: MediaProviderType = MediaProviderType.S3;

  @IsString()
  CLOUDINARY_CLOUD_NAME: string;

  @IsString()
  CLOUDINARY_API_KEY: string;

  @IsString()
  CLOUDINARY_API_SECRET: string;

  @IsString()
  AWS_S3_BUCKET_NAME: string;

  @IsString()
  AWS_S3_REGION: string;

  @IsString()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  AWS_CLOUDFRONT_DOMAIN: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  MAX_FILE_SIZE?: number = 100 * 1024 * 1024;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  MAX_VIDEO_SIZE?: number = 10 * 1024 * 1024 * 1024;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ENABLE_TRANSFORMATIONS?: boolean = true;

  @IsOptional()
  @IsString()
  DEFAULT_FOLDER?: string = 'nlc-ai/uploads';
}
