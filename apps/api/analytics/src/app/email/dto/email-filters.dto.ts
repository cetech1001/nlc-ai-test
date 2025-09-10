import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum MetricPeriod {
  LAST_7_DAYS = '7d',
  LAST_30_DAYS = '30d',
  LAST_90_DAYS = '90d',
  CUSTOM = 'custom'
}

export enum MetricType {
  ENGAGEMENT = 'engagement',
  DELIVERABILITY = 'deliverability',
  TEMPLATES = 'templates',
  SEQUENCES = 'sequences'
}

export class EmailFiltersDto {
  @ApiProperty({ enum: MetricPeriod, required: false, default: MetricPeriod.LAST_30_DAYS })
  @IsOptional()
  @IsEnum(MetricPeriod)
  period?: MetricPeriod = MetricPeriod.LAST_30_DAYS;

  @ApiProperty({ required: false, description: 'Custom start date (ISO string)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'Custom end date (ISO string)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ enum: MetricType, required: false })
  @IsOptional()
  @IsEnum(MetricType)
  metricType?: MetricType;

  @ApiProperty({ required: false, description: 'Template category filter' })
  @IsOptional()
  @IsString()
  templateCategory?: string;

  @ApiProperty({ required: false, description: 'Sequence category filter' })
  @IsOptional()
  @IsString()
  sequenceCategory?: string;

  @ApiProperty({ required: false, minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
