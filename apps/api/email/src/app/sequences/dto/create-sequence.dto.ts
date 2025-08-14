import { IsString, IsOptional, IsArray, IsBoolean, IsEnum, IsNumber, ValidateNested, MinLength, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum TriggerType {
  MANUAL = 'manual',
  LEAD_CREATED = 'lead_created',
  CLIENT_ONBOARDED = 'client_onboarded',
  FORM_SUBMITTED = 'form_submitted',
  CONSULTATION_BOOKED = 'consultation_booked'
}

export class SequenceEmailDto {
  @ApiProperty({ description: 'Template ID to use for this email' })
  @IsString()
  templateID: string;

  @ApiProperty({ description: 'Delay in days before sending this email', minimum: 0 })
  @IsNumber()
  @Min(0)
  delayDays: number;

  @ApiProperty({ description: 'Order of this email in the sequence', minimum: 1 })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiProperty({ required: false, description: 'Custom subject override' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customSubject?: string;

  @ApiProperty({ required: false, description: 'Custom content override' })
  @IsOptional()
  @IsString()
  customContent?: string;
}

export class CreateSequenceDto {
  @ApiProperty({ description: 'Sequence name', example: 'New Lead Nurture' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ required: false, description: 'Sequence description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Sequence category', example: 'lead-nurture' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category: string;

  @ApiProperty({ enum: TriggerType, description: 'How this sequence is triggered' })
  @IsEnum(TriggerType)
  triggerType: TriggerType;

  @ApiProperty({ required: false, description: 'Whether sequence is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ type: [SequenceEmailDto], description: 'Emails in this sequence' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SequenceEmailDto)
  emails: SequenceEmailDto[];
}
