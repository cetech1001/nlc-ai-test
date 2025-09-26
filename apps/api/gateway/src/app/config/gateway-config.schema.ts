import { IsString, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class GatewayConfigSchema {
  @IsString()
  NODE_ENV: string = 'development';

  @IsOptional()
  @IsString()
  SERVICE_NAME?: string = 'api-gateway';

  @IsOptional()
  @IsString()
  SERVICE_VERSION?: string = '1.0.0';

  @IsString()
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string = '24h';

  // Service URLs
  @IsString()
  AUTH_SERVICE_URL: string;

  @IsString()
  USERS_SERVICE_URL: string;

  @IsString()
  MEDIA_SERVICE_URL: string;

  @IsString()
  EMAIL_SERVICE_URL: string;

  @IsString()
  BILLING_SERVICE_URL: string;

  @IsString()
  LEADS_SERVICE_URL: string;

  @IsString()
  NOTIFICATIONS_SERVICE_URL: string;

  @IsString()
  INTEGRATIONS_SERVICE_URL: string;

  @IsString()
  COMMUNITIES_SERVICE_URL: string;

  @IsString()
  ANALYTICS_SERVICE_URL: string;

  @IsString()
  AGENTS_SERVICE_URL: string;

  @IsString()
  MESSAGES_SERVICE_URL: string;

  @IsString()
  COURSES_SERVICE_URL: string;

  // Rate limiting
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  RATE_LIMIT_TTL?: number = 60000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  RATE_LIMIT_MAX?: number = 100;

  // CORS
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value?.split(',') || [])
  CORS_ORIGINS?: string[];

  @IsOptional()
  @IsBoolean()
  // @Transform(({ value }) => value === 'false')
  CORS_CREDENTIALS?: boolean = true;

  // Cache
  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  CACHE_TTL?: number = 300;

  // Request timeout
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  REQUEST_TIMEOUT?: number = 30000;

  // Load balancing
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ENABLE_LOAD_BALANCING?: boolean = false;

  // Circuit breaker
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  CIRCUIT_BREAKER_FAILURE_THRESHOLD?: number = 5;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  CIRCUIT_BREAKER_TIMEOUT?: number = 10000;

  // Monitoring
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ENABLE_METRICS?: boolean = true;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  ENABLE_TRACING?: boolean = false;
}
