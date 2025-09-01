import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class MarkPaymentRequestPaidDto {
  @ApiProperty({ example: 'txn_123456789' })
  @IsString()
  @IsUUID()
  transactionID: string;

  @ApiProperty({ example: 29999, required: false, description: 'Amount paid in cents' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  paidAmount?: number;

  @ApiProperty({ example: '2025-09-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  paidAt?: Date;
}
