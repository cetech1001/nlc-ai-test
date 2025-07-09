import {ApiPropertyOptional} from "@nestjs/swagger";
import {IsDateString, IsEnum, IsInt, IsOptional, IsString, Min} from "class-validator";
import {Type} from "class-transformer";
import {LeadStatus} from "./create-lead.dto";

export class LeadQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: LeadStatus, description: 'Filter by lead status' })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Filter by sources (comma-separated)' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Search query for name, email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by creation start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by creation end date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by meeting start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  meetingStartDate?: string;

  @ApiPropertyOptional({ description: 'Filter by meeting end date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  meetingEndDate?: string;
}
