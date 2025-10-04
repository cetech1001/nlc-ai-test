import { IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class LeadsConfigSchema {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  REDIS_URL: string;

  @IsString()
  RABBITMQ_URL: string;

  @IsString()
  RABBITMQ_EXCHANGE: string;

  @IsString()
  SERVICE_NAME?: string = 'leads';

  @IsString()
  ANTI_SPAM_TOKEN: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  ANTI_SPAM_WINDOW_MS: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  ANTI_SPAM_REPLAY_TTL_MS: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  ANTI_SPAM_RATE_WINDOW_MS: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  ANTI_SPAM_RATE_MAX: number;
}
