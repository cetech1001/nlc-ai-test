import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {EmailThreadStatus, EmailThreadPriority, type ThreadsQueryRequest, type DateRange} from '@nlc-ai/types';
import {PaginationDto, DateRangeDto, toBool} from "@nlc-ai/api-dto";

export class ThreadsQueryDto extends PaginationDto implements ThreadsQueryRequest{
  @IsOptional()
  @IsString()
  coachID?: string;

  @IsOptional()
  @IsString()
  clientID?: string;

  @IsOptional()
  @IsString()
  leadID?: string;

  @IsOptional()
  @IsEnum(EmailThreadStatus)
  status?: EmailThreadStatus;

  @IsOptional()
  @IsEnum(EmailThreadPriority)
  priority?: EmailThreadPriority;

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRange;
}
