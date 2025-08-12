import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString, IsString, IsNumber, IsObject } from 'class-validator';
import {Transform, Type} from "class-transformer";
import { TransactionStatus } from '@prisma/client';
import { UpdateTransactionRequest } from '@nlc-ai/api-types';

export class UpdateTransactionDto implements UpdateTransactionRequest {
  @ApiProperty({ enum: TransactionStatus, required: false })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({ example: '2025-08-12T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  paidAt?: Date;

  @ApiProperty({ example: 'Insufficient funds', required: false })
  @IsOptional()
  @IsString()
  failureReason?: string;

  @ApiProperty({ example: 'Customer requested refund', required: false })
  @IsOptional()
  @IsString()
  refundReason?: string;

  @ApiProperty({ example: 2500, required: false, description: 'Refunded amount in cents' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  refundedAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
