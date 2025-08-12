import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsNumber, IsDateString } from 'class-validator';
import {Transform, Type} from "class-transformer";
import { TransactionStatus, PaymentMethodType } from '@prisma/client';
import { TransactionFilters } from '@nlc-ai/api-types';

export class TransactionFiltersDto implements TransactionFilters {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  coachID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  planID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  subscriptionID?: string;

  @ApiProperty({ enum: TransactionStatus, required: false })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({ enum: PaymentMethodType, required: false })
  @IsOptional()
  @IsEnum(PaymentMethodType)
  paymentMethod?: PaymentMethodType;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minAmount?: number;

  @ApiProperty({ example: 10000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxAmount?: number;

  @ApiProperty({ example: '2025-08-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  startDate?: Date;

  @ApiProperty({ example: '2025-08-31T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  endDate?: Date;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;
}
