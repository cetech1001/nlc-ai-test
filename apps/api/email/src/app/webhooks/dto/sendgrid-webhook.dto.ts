import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SendGridEventDto {
  @ApiProperty()
  @IsString()
  event: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty({ name: 'sg_message_id' })
  @IsString()
  sg_message_id: string;

  @ApiProperty()
  @IsNumber()
  timestamp: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  useragent?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, name: 'unique_args' })
  @IsOptional()
  unique_args?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type?: string;
}

export class SendGridWebhookDto {
  @ApiProperty({ type: [SendGridEventDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SendGridEventDto)
  events: SendGridEventDto[];
}
