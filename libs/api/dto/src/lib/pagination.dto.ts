import { ApiProperty } from '@nestjs/swagger';
import {IsOptional, Min, Max, IsInt} from 'class-validator';
import {Transform} from "class-transformer";
import {toInt} from "./helpers";

export class PaginationDto {
  @ApiProperty({ example: 1, required: false, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, required: false, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
