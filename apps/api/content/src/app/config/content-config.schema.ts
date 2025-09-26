import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class ContentConfigSchema {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  RABBITMQ_URL: string;

  @IsOptional()
  @IsString()
  RABBITMQ_EXCHANGE?: string = 'nlc.domain.events';

  @IsOptional()
  @IsString()
  SERVICE_NAME?: string = 'integrations';

  @IsString()
  JWT_SECRET: string;

  @IsString()
  ENCRYPTION_KEY: string;

  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  META_CLIENT_ID: string;

  @IsString()
  META_CLIENT_SECRET: string;

  @IsString()
  INSTAGRAM_CLIENT_ID: string;

  @IsString()
  INSTAGRAM_CLIENT_SECRET: string;

  @IsString()
  TWITTER_CLIENT_ID: string;

  @IsString()
  TWITTER_CLIENT_SECRET: string;

  @IsString()
  TIKTOK_CLIENT_ID: string;

  @IsString()
  TIKTOK_CLIENT_SECRET: string;

  @IsString()
  API_BASE_URL: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  TOKEN_REFRESH_BUFFER_MS?: number = 300000;
}
