import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import {Type} from "class-transformer";

export class PaginationDto {
  @ApiProperty({ example: 1, required: false, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ example: 10, required: false, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}
