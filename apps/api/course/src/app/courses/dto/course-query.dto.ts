import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PricingType } from './create-course.dto';

export class CourseQueryDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term for title or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by difficulty level' })
  @IsOptional()
  @IsString()
  difficultyLevel?: string;

  @ApiPropertyOptional({ description: 'Filter by pricing type', enum: PricingType })
  @IsOptional()
  @IsEnum(PricingType)
  pricingType?: PricingType;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by published status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Filter by coach ID' })
  @IsOptional()
  @IsString()
  coachID?: string;

  @ApiPropertyOptional({ description: 'Sort by field (title, createdAt, price, enrollments)' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order (asc, desc)', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Minimum price filter (in cents)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter (in cents)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by creation date start (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  createdAfter?: string;

  @ApiPropertyOptional({ description: 'Filter by creation date end (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  createdBefore?: string;
}
