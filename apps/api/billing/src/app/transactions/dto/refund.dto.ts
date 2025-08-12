import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';
import {Type} from "class-transformer";
import { RefundRequest } from '@nlc-ai/api-types';

export class RefundDto implements RefundRequest {
  @ApiProperty({ example: 2500, required: false, description: 'Partial refund amount in cents. If not provided, full refund' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amount?: number;

  @ApiProperty({ example: 'Customer requested refund due to dissatisfaction' })
  @IsString()
  reason: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  refundToOriginalPaymentMethod?: boolean;
}
