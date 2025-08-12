import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsObject,
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { InvoiceStatus } from '@prisma/client';
import {InvoiceLineItem, UpdateInvoiceRequest} from '@nlc-ai/api-types';
import {InvoiceLineItemDto} from "./invoice-line-item.dto";

export class UpdateInvoiceDto implements UpdateInvoiceRequest {
  @ApiProperty({ enum: InvoiceStatus, required: false })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiProperty({ example: '2025-09-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  paidAt?: Date;

  @ApiProperty({ type: [InvoiceLineItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems?: InvoiceLineItem[];

  @ApiProperty({ example: 5000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  subtotal?: number;

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

  @ApiProperty({ example: 5250, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  total?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
