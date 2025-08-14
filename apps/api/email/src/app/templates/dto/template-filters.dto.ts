import { IsOptional, IsString, IsArray, IsBoolean, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum TemplateSortBy {
  NAME = 'name',
  CATEGORY = 'category',
  USAGE_COUNT = 'usageCount',
  CREATED_AT = 'createdAt',
  LAST_USED_AT = 'lastUsedAt'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class TemplateFiltersDto {
  @ApiProperty({ required: false, description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false, description: 'Search in name, description, and content' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter by tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, description: 'Filter by AI generated status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isAiGenerated?: boolean;

  @ApiProperty({ required: false, description: 'Filter by active status', default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ enum: TemplateSortBy, required: false, default: TemplateSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(TemplateSortBy)
  sortBy?: TemplateSortBy = TemplateSortBy.CREATED_AT;

  @ApiProperty({ enum: SortOrder, required: false, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiProperty({ required: false, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
