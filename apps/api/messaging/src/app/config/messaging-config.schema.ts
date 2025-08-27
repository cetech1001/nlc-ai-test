import {IsString, IsOptional, IsNumber, IsArray, IsBoolean} from 'class-validator';
import { Transform } from 'class-transformer';

export class MessagingConfigSchema {
  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  DATABASE_SCHEMA?: string = 'public';

  @IsString()
  RABBITMQ_URL: string;

  @IsOptional()
  @IsString()
  RABBITMQ_EXCHANGE?: string = 'nlc.domain.events';

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value?.split(',') || [])
  CORS_ORIGINS?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  CORS_CREDENTIALS?: boolean = true;

  @IsString()
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string = '24h';

  @IsOptional()
  @IsString()
  SERVICE_NAME?: string = 'users-service';

  @IsOptional()
  @IsString()
  SERVICE_VERSION?: string = '1.0.0';

  @IsOptional()
  @IsString()
  NODE_ENV?: string = 'development';

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  MAX_RETRIES?: number = 3;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  CACHE_TTL?: number = 300; // 5 minutes
}
