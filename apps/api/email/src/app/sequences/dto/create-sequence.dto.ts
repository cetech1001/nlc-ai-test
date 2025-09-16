import { IsString, IsOptional, IsArray, IsEnum, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  CreateEmailSequenceRequest,
  EmailCondition, EmailConditionOperator, EmailConditionType,
  EmailSequenceTriggerType,
  EmailSequenceType,
} from "@nlc-ai/types";

export class EmailConditionDto implements EmailCondition{
  @ApiProperty({ description: 'Condition field to check' })
  @IsString()
  field: string;

  @ApiProperty({ enum: EmailConditionOperator, description: 'Condition operator (equals, contains, greater_than, etc.)' })
  @IsEnum(EmailConditionOperator)
  operator: EmailConditionOperator;

  @ApiProperty({ enum: EmailConditionType, description: 'Condition type' })
  @IsEnum(EmailConditionType)
  type: EmailConditionType;

  @ApiProperty({ description: 'Value to compare against' })
  @IsString()
  value: string;
}

export class CreateSequenceDto implements CreateEmailSequenceRequest{
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

  @ApiProperty({ enum: EmailSequenceType, description: 'Sequence type' })
  @IsEnum(EmailSequenceType)
  type: EmailSequenceType;

  @ApiProperty({ enum: EmailSequenceTriggerType, description: 'How this sequence is triggered' })
  @IsEnum(EmailSequenceTriggerType)
  triggerType: EmailSequenceTriggerType;

  @ApiProperty({ type: [EmailConditionDto], required: false, description: 'Conditions that must be met to trigger the sequence' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailConditionDto)
  triggerConditions?: EmailCondition[];
}
