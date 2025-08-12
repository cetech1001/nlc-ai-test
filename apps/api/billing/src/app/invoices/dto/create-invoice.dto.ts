import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {CreateInvoiceRequest, InvoiceLineItem} from '@nlc-ai/api-types';
import {InvoiceLineItemDto} from "./invoice-line-item.dto";

export class CreateInvoiceDto implements CreateInvoiceRequest {
  @ApiProperty({ example: 'coach_123456789' })
  @IsString()
  @IsUUID()
  coachID: string;

  @ApiProperty({ example: 'sub_123456789', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  subscriptionID?: string;

  @ApiProperty({ example: 'txn_123456789', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  transactionID?: string;

  @ApiProperty({ example: 5000, description: 'Amount in cents' })
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: '2025-09-15T00:00:00.000Z' })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  dueDate: Date;

  @ApiProperty({
    type: [InvoiceLineItemDto],
    example: [
      {
        description: 'Premium Plan Subscription',
        quantity: 1,
        unitPrice: 5000,
        amount: 5000
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems: InvoiceLineItem[];

  @ApiProperty({ example: 5000, description: 'Subtotal in cents' })
  @IsNumber()
  @Type(() => Number)
  subtotal: number;

  @ApiProperty({ example: 0.1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  taxRate?: number;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  taxAmount?: number;

  @ApiProperty({ example: 250, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discountAmount?: number;

  @ApiProperty({ example: 5250, description: 'Total amount in cents' })
  @IsNumber()
  @Type(() => Number)
  total: number;

  @ApiProperty({ example: 'Invoice for Premium Plan subscription', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
