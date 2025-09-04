import { IsString, IsOptional } from 'class-validator';

export class NotificationsConfigSchema {
  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  DATABASE_SCHEMA?: string = 'comms';

  @IsString()
  RABBITMQ_URL: string;

  @IsOptional()
  @IsString()
  RABBITMQ_EXCHANGE?: string = 'nlc.domain.events';

  @IsOptional()
  @IsString()
  SERVICE_NAME?: string = 'notifications-service';
}
