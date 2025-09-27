import {IsOptional, IsString} from "class-validator";

export class AuthConfigSchema {
  @IsOptional()
  NODE_ENV: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  REDIS_URL: string;

  @IsString()
  RABBITMQ_URL: string;

  @IsString()
  RABBITMQ_EXCHANGE: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  PUBLIC_TOKEN_NAME: string;

  @IsOptional()
  @IsString()
  SERVICE_NAME?: string = 'auth';
}
