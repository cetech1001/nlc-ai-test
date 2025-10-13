import {ApiProperty} from "@nestjs/swagger";
import {IsEnum, IsOptional, IsString} from "class-validator";
import {EmailParticipantType} from "@nlc-ai/types";

export class ExecuteSequenceDto {
  @ApiProperty({ description: 'Target recipient ID (lead, client, or coach ID)' })
  @IsString()
  targetID: string;

  @ApiProperty({ enum: EmailParticipantType, description: 'Type of target recipient' })
  @IsEnum(EmailParticipantType)
  targetType: EmailParticipantType;

  @ApiProperty({ required: false, description: 'Additional template variables' })
  @IsOptional()
  templateVariables?: Record<string, any>;

  @ApiProperty({ required: false, description: 'Override start date (default: now)' })
  @IsOptional()
  startDate?: Date;
}
