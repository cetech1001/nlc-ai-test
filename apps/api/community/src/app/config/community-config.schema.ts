import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CommunityConfigSchema {
  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  DATABASE_SCHEMA?: string = 'community';

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
  SERVICE_NAME?: string = 'community-service';

  @IsOptional()
  @IsString()
  SERVICE_VERSION?: string = '1.0.0';

  @IsOptional()
  @IsString()
  NODE_ENV?: string = 'development';

  // Community Features Configuration
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  MAX_POST_LENGTH?: number = 5000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  MAX_MESSAGE_LENGTH?: number = 2000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  MAX_COMMUNITY_MEMBERS?: number = 10000;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ENABLE_COACH_TO_COACH_COMMUNITY?: boolean = true;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ENABLE_MEDIA_ATTACHMENTS?: boolean = true;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  MESSAGE_RETENTION_DAYS?: number = 365;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  POST_RETENTION_DAYS?: number = 730;
}
