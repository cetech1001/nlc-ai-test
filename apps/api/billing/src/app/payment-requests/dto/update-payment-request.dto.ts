import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsObject, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { UpdatePaymentRequestRequest } from '@nlc-ai/api-types';

export enum PaymentRequestStatus {
  PENDING = 'pending',
  PAID = 'paid',
  EXPIRED = 'expired',
  CANCELED = 'canceled'
}

export class UpdatePaymentRequestDto implements UpdatePaymentRequestRequest {
  @ApiProperty({ example: 'Payment for Advanced JavaScript Course', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Please complete payment by end of week', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '2025-09-30T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  expiresAt?: Date;

  @ApiProperty({
    example: 'pending',
    enum: PaymentRequestStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentRequestStatus)
  status?: PaymentRequestStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
