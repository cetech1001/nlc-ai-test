import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsDateString, IsEnum } from 'class-validator';
import {Transform} from "class-transformer";

export class RevenueReportFiltersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  coachID?: string;

  @ApiProperty({ example: '2025-08-01T00:00:00.000Z' })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty({ example: '2025-08-31T00:00:00.000Z' })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @ApiProperty({ enum: ['day', 'week', 'month', 'year'] })
  @IsEnum(['day', 'week', 'month', 'year'])
  groupBy: 'day' | 'week' | 'month' | 'year';
}
