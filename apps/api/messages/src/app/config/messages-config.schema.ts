import {IsString, IsOptional, IsNumber} from 'class-validator';
import { Transform } from 'class-transformer';

export class MessagesConfigSchema {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  RABBITMQ_URL: string;

  @IsString()
  RABBITMQ_EXCHANGE: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsOptional()
  @IsString()
  SERVICE_NAME?: string = 'messages';

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
  CACHE_TTL?: number = 300;
}
