import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNumber, IsEmail, Min, Max } from 'class-validator';
import { UpdatePaymentMethodRequest } from '@nlc-ai/api-types';

export class UpdatePaymentMethodDto implements UpdatePaymentMethodRequest {
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

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
