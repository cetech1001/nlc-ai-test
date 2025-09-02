import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID, IsEnum, IsNumber, IsEmail, Min, Max } from 'class-validator';
import { PaymentMethodType } from '@prisma/client';
import { CreatePaymentMethodRequest } from '@nlc-ai/api-types';

export class CreatePaymentMethodDto implements CreatePaymentMethodRequest {
  @ApiProperty({ example: 'coach_123456789' })
  @IsOptional()
  @IsString()
  @IsUUID()
  coachID?: string;

  @ApiProperty({ example: 'client_123456789' })
  @IsOptional()
  @IsString()
  @IsUUID()
  clientID?: string;

  @ApiProperty({ enum: PaymentMethodType })
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ example: '4242', required: false })
  @IsOptional()
  @IsString()
  cardLast4?: string;

  @ApiProperty({ example: 'visa', required: false })
  @IsOptional()
  @IsString()
  cardBrand?: string;

  @ApiProperty({ example: 12, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  cardExpMonth?: number;

  @ApiProperty({ example: 2027, required: false })
  @IsOptional()
  @IsNumber()
  @Min(new Date().getFullYear())
  cardExpYear?: number;

  @ApiProperty({ example: 'pm_1234567890abcdef', required: false })
  @IsOptional()
  @IsString()
  stripePaymentMethodID?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  paypalEmail?: string;
}
