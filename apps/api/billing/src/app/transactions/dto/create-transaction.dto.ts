import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsNumber, IsEnum, IsDateString, IsObject } from 'class-validator';
import {Type, Transform} from "class-transformer";
import { PaymentMethodType } from '@prisma/client';
import { CreateTransactionRequest } from '@nlc-ai/api-types';

export class CreateTransactionDto implements CreateTransactionRequest {
  @ApiProperty({ example: 'coach_123456789' })
  @IsString()
  @IsUUID()
  coachID: string;

  @ApiProperty({ example: 'plan_123456789' })
  @IsString()
  @IsUUID()
  planID: string;

  @ApiProperty({ example: 'sub_123456789', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  subscriptionID?: string;

  @ApiProperty({ example: 5000, description: 'Amount in cents' })
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ enum: PaymentMethodType })
  @IsEnum(PaymentMethodType)
  paymentMethod: PaymentMethodType;

  @ApiProperty({ example: 'pi_1234567890abcdef', required: false })
  @IsOptional()
  @IsString()
  stripePaymentID?: string;

  @ApiProperty({ example: 'PAYID-1234567890', required: false })
  @IsOptional()
  @IsString()
  paypalOrderID?: string;

  @ApiProperty({ example: 'Payment for Premium Plan', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ example: '2025-08-12T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  invoiceDate?: Date;

  @ApiProperty({ example: '2025-08-26T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  dueDate?: Date;
}
