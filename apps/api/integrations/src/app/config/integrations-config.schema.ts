import { IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class IntegrationsConfigSchema {
  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  DATABASE_SCHEMA?: string = 'main';

  @IsString()
  RABBITMQ_URL: string;

  @IsOptional()
  @IsString()
  RABBITMQ_EXCHANGE?: string = 'nlc.domain.events';

  @IsOptional()
  @IsString()
  SERVICE_NAME?: string = 'integrations-service';

  @IsString()
  JWT_SECRET: string;

  @IsString()
  ENCRYPTION_KEY: string;

  // Google OAuth
  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsOptional()
  @IsUrl()
  GOOGLE_EMAIL_REDIRECT_URI?: string;

  @IsOptional()
  @IsUrl()
  YOUTUBE_REDIRECT_URI?: string;

  // Microsoft OAuth
  @IsOptional()
  @IsString()
  MICROSOFT_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  MICROSOFT_CLIENT_SECRET?: string;

  @IsOptional()
  @IsUrl()
  MICROSOFT_EMAIL_REDIRECT_URI?: string;

  // Meta (Facebook/Instagram)
  @IsOptional()
  @IsString()
  META_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  META_CLIENT_SECRET?: string;

  // LinkedIn
  @IsOptional()
  @IsString()
  LINKEDIN_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  LINKEDIN_CLIENT_SECRET?: string;

  // Twitter/X
  @IsOptional()
  @IsString()
  TWITTER_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  TWITTER_CLIENT_SECRET?: string;

  // TikTok
  @IsOptional()
  @IsString()
  TIKTOK_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  TIKTOK_CLIENT_SECRET?: string;

  // Calendly
  @IsOptional()
  @IsString()
  CALENDLY_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  CALENDLY_CLIENT_SECRET?: string;

  @IsOptional()
  @IsUrl()
  API_BASE_URL?: string = 'http://localhost:3003';

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  TOKEN_REFRESH_BUFFER_MS?: number = 300000; // 5 minutes
}
