import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsBoolean, IsDateString, IsIn } from 'class-validator';
import { Transform } from "class-transformer";
import { PaymentMethodType } from '@prisma/client';
import {PaymentMethodFilters, UserType} from '@nlc-ai/api-types';

export class PaymentMethodFiltersDto implements PaymentMethodFilters {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  userID?: string;

  @ApiProperty({ enum: [UserType.coach, UserType.client], required: false })
  @IsOptional()
  @IsString()
  @IsIn([UserType.coach, UserType.client])
  userType?: UserType;

  @ApiProperty({ enum: PaymentMethodType, required: false })
  @IsOptional()
  @IsEnum(PaymentMethodType)
  type?: PaymentMethodType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isDefault?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiProperty({ example: 'visa', required: false })
  @IsOptional()
  @IsString()
  cardBrand?: string;

  @ApiProperty({ example: '2025-12-31T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  expiringBefore?: Date;
}
