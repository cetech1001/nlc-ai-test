import { ApiProperty } from '@nestjs/swagger';
import {IsOptional, IsBoolean, IsString, ValidateNested} from 'class-validator';
import {Type, Transform} from "class-transformer";
import {AmountRangeDto, PlanFilters} from '@nlc-ai/api-types';

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

  @ApiProperty({ type: AmountRangeDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AmountRangeDto)
  priceRange?: {
    min?: number;
    max?: number;
  };
}
