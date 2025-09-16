import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength, ValidateNested} from "class-validator";
import {
  EmailSequenceStatus,
  EmailSequenceTriggerType,
  EmailSequenceType,
  UpdateEmailSequenceRequest
} from "@nlc-ai/types";
import {Type} from "class-transformer";
import {EmailConditionDto} from "./create-sequence.dto";

export class UpdateSequenceDto implements UpdateEmailSequenceRequest{
  @ApiProperty({ required: false, description: 'Sequence name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false, description: 'Sequence description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: EmailSequenceType, required: false, description: 'Sequence type' })
  @IsOptional()
  @IsEnum(EmailSequenceType)
  type?: EmailSequenceType;

  @ApiProperty({ enum: EmailSequenceTriggerType, required: false, description: 'How this sequence is triggered' })
  @IsOptional()
  @IsEnum(EmailSequenceTriggerType)
  triggerType?: EmailSequenceTriggerType;

  @ApiProperty({ type: [EmailConditionDto], required: false, description: 'Updated trigger conditions' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailConditionDto)
  triggerConditions?: EmailConditionDto[];

  @ApiProperty({ enum: EmailSequenceStatus, required: false, description: 'Sequence status' })
  @IsOptional()
  @IsEnum(EmailSequenceStatus)
  status?: EmailSequenceStatus;

  @ApiProperty({ required: false, description: 'Whether sequence is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
