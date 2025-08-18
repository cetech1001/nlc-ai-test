import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import {Transform} from "class-transformer";

export class DateRangeDto {
  @ApiProperty({ example: '2025-08-01T00:00:00.000Z' })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  start: Date;

  @ApiProperty({ example: '2025-08-31T00:00:00.000Z' })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  end: Date;
}
