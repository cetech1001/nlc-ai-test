import {IsString, IsEmail, IsOptional, IsArray, ValidateNested, IsISO8601, IsDateString} from 'class-validator';
import {Transform, Type} from 'class-transformer';
import {EmailAttachment, EmailThreadPriority, SendEmailRequest} from '@nlc-ai/types';

export class EmailAttachmentDto implements EmailAttachment {
  @IsString()
  filename: string;

  @IsString()
  content: string;

  @IsString()
  contentType: string;

  @IsOptional()
  size?: number;
}

export class SendEmailDto implements SendEmailRequest {
  @IsOptional()
  threadID?: string;

  @IsEmail({}, { each: true })
  to: string | string[];

  @IsOptional()
  @IsEmail({}, { each: true })
  cc?: string[];

  @IsOptional()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  templateID?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAttachmentDto)
  attachments?: EmailAttachment[];

  @IsOptional()
  @IsISO8601({ strict: true })
  @IsDateString()
  @Transform(({ value }) => {
    if (value) {
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        throw new Error('Schedule date must be in the future');
      }
    }
    return value;
  })
  scheduleFor?: string;

  @IsOptional()
  priority?: EmailThreadPriority;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  metadata?: Record<string, any>;
}
