import { IsOptional, IsString, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { CoachQueryParams, CoachStatus } from '@nlc-ai/api-types';

export class CoachQueryDto implements CoachQueryParams {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: CoachStatus, description: 'Filter by coach status' })
  @IsOptional()
  @IsEnum(CoachStatus)
  status?: CoachStatus;

  @ApiPropertyOptional({ description: 'Search query for name, email, business name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by subscription plans (comma-separated)' })
  @IsOptional()
  @IsString()
  subscriptionPlan?: string;

  @ApiPropertyOptional({ description: 'Filter by date joined start (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateJoinedStart?: string;

  @ApiPropertyOptional({ description: 'Filter by date joined end (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateJoinedEnd?: string;

  @ApiPropertyOptional({ description: 'Filter by last active start (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  lastActiveStart?: string;

  @ApiPropertyOptional({ description: 'Filter by last active end (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  lastActiveEnd?: string;

  @ApiPropertyOptional({ description: 'Filter by email verification status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Include inactive coaches in results', default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeInactive?: boolean = true;

  @ApiPropertyOptional({ description: 'Include deleted coaches in results', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeDeleted?: boolean = false;
}
