import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsNumber } from 'class-validator';
import {Type, Transform} from "class-transformer";
import { PlanFilters } from '../types/plan.interfaces';

export class PlanFiltersDto implements PlanFilters {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiProperty({ example: 'Premium', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @ApiProperty({ example: 10000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;
}
