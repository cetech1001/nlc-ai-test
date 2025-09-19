import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '@nlc-ai/api-dto';
import { ModerationStatus, ModerationPriority, ViolationType, ModerationActionType } from '@nlc-ai/api-types';

export class ModerationFiltersDto extends PaginationDto {
  @ApiProperty({ enum: ModerationStatus, required: false })
  @IsOptional()
  @IsEnum(ModerationStatus)
  status?: ModerationStatus;

  @ApiProperty({ enum: ModerationPriority, required: false })
  @IsOptional()
  @IsEnum(ModerationPriority)
  priority?: ModerationPriority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contentType?: 'post' | 'comment' | 'message';

  @ApiProperty({ enum: ViolationType, required: false, isArray: true })
  @IsOptional()
  @IsEnum(ViolationType, { each: true })
  violationType?: ViolationType | ViolationType[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  flagCountMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  flagCountMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateRangeStart?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateRangeEnd?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  // For moderation actions
  @ApiProperty({ enum: ModerationActionType, required: false })
  @IsOptional()
  @IsEnum(ModerationActionType)
  type?: ModerationActionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  targetType?: 'post' | 'comment' | 'message' | 'member';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  moderatorID?: string;
}
