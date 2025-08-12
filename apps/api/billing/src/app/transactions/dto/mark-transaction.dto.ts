import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString } from 'class-validator';
import {Transform} from "class-transformer";

export class MarkTransactionCompletedDto {
  @ApiProperty({ example: '2025-08-12T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  paidAt?: Date;
}

export class MarkTransactionFailedDto {
  @ApiProperty({ example: 'Insufficient funds' })
  @IsString()
  failureReason: string;
}
