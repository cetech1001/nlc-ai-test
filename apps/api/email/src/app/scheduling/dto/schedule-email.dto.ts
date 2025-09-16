import { IsString, IsOptional, IsDateString, IsNumber, IsObject, IsUUID } from 'class-validator';

export class ScheduleEmailDto {
  @IsString()
  to: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsDateString()
  scheduledFor: string;

  @IsOptional()
  @IsUUID()
  coachID?: string;

  @IsOptional()
  @IsUUID()
  clientID?: string;

  @IsOptional()
  @IsUUID()
  leadID?: string;

  @IsOptional()
  @IsUUID()
  emailThreadID?: string;

  @IsOptional()
  @IsUUID()
  emailSequenceID?: string;

  @IsOptional()
  @IsNumber()
  sequenceOrder?: number;

  @IsOptional()
  @IsUUID()
  templateID?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
