// apps/api/leads/src/app/config/leads-config.schema.ts
import { IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class LeadsConfigSchema {
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
  @IsString()
  SERVICE_NAME?: string = 'leads-service';

  // Landing Page Integration
  @IsOptional()
  @IsString()
  LEADS_PUBLIC_TOKEN?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  LEADS_TOKEN_WINDOW_MS?: number = 300000; // 5 minutes

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  LEADS_REPLAY_TTL_MS?: number = 600000; // 10 minutes

  // External Services
  @IsOptional()
  @IsUrl()
  EMAIL_SERVICE_URL?: string = 'http://localhost:3002';

  @IsOptional()
  @IsString()
  EMAIL_SERVICE_TOKEN?: string;

  @IsOptional()
  @IsUrl()
  GATEWAY_SERVICE_URL?: string = 'http://localhost:3001';

  @IsOptional()
  @IsString()
  GATEWAY_SERVICE_TOKEN?: string;
}
