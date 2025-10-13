import { IsString, IsOptional, IsArray, IsEnum, ValidateNested, MinLength, MaxLength, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  CreateEmailSequenceRequest,
  EmailCondition,
  EmailConditionOperator,
  EmailConditionType,
  EmailSequenceTriggerType,
  EmailSequenceType,
} from "@nlc-ai/types";

export class EmailConditionDto implements EmailCondition {
  @ApiProperty({ description: 'Condition field to check' })
  @IsString()
  field: string;

  @ApiProperty({ enum: EmailConditionOperator, description: 'Condition operator' })
  @IsEnum(EmailConditionOperator)
  operator: EmailConditionOperator;

  @ApiProperty({ enum: EmailConditionType, description: 'Condition type' })
  @IsEnum(EmailConditionType)
  type: EmailConditionType;

  @ApiProperty({ description: 'Value to compare against' })
  @IsString()
  value: string;
}

export class SequenceStepDto {
  @ApiProperty({ description: 'Step order in sequence' })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiProperty({ description: 'Delay in days before sending this step' })
  @IsNumber()
  @Min(0)
  delayDays: number;

  @ApiProperty({ description: 'Template ID to use for this step' })
  @IsString()
  templateID: string;

  @ApiProperty({ description: 'Email subject (can use template variables)' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Optional conditions for this step', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailConditionDto)
  conditions?: EmailCondition[];
}

export class CreateSequenceDto implements CreateEmailSequenceRequest {
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

  @ApiProperty({ enum: EmailSequenceTriggerType, description: 'How this sequence is triggered?' })
  @IsEnum(EmailSequenceTriggerType)
  triggerType: EmailSequenceTriggerType;

  @ApiProperty({ enum: EmailSequenceType, description: 'Email sequence type' })
  @IsEnum(EmailSequenceType)
  type: EmailSequenceType;

  @ApiProperty({ type: [EmailConditionDto], required: false, description: 'Conditions that must be met to trigger the sequence' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailConditionDto)
  triggerConditions?: EmailCondition[];

  @ApiProperty({ type: [SequenceStepDto], description: 'Email sequence steps' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SequenceStepDto)
  steps: SequenceStepDto[];
}
