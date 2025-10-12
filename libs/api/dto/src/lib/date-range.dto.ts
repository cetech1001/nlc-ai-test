import { ApiProperty } from '@nestjs/swagger';
import {IsISO8601} from 'class-validator';
import {Transform} from "class-transformer";
import {toDate} from "./helpers";

export class DateRangeDto {
  @ApiProperty({ example: '2025-08-01T00:00:00.000Z' })
  @IsISO8601()
  @Transform(({ value }) => toDate(value))
  start: Date;

  @ApiProperty({ example: '2025-08-31T00:00:00.000Z' })
  @IsISO8601()
  @Transform(({ value }) => toDate(value))
  end: Date;
}
