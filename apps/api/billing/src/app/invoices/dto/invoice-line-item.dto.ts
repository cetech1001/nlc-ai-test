import {InvoiceLineItem} from "@nlc-ai/api-types";
import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsObject, IsOptional, IsString, IsUUID} from "class-validator";
import {Type} from "class-transformer";

export class InvoiceLineItemDto implements InvoiceLineItem{
  @ApiProperty({ example: 'Premium Plan Subscription' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 5000, description: 'Unit price in cents' })
  @IsNumber()
  @Type(() => Number)
  unitPrice: number;

  @ApiProperty({ example: 5000, description: 'Total amount in cents' })
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 'plan_123456789', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  planID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
