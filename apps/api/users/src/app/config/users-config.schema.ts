import { IsString, IsOptional } from 'class-validator';

export class UsersConfigSchema {
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

  @IsString()
  NODE_ENV: string;

  @IsOptional()
  @IsString()
  SERVICE_NAME?: string = 'users';
}
