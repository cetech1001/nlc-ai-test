import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsDateString, IsIn } from 'class-validator';
import { Transform } from "class-transformer";
import {PaymentRequestFilters, UserType, PaymentRequestFiltersStatus} from '@nlc-ai/types';
import {PaymentRequestType} from "@prisma/client";

export class PaymentRequestFiltersDto implements PaymentRequestFilters {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  payerID?: string;

  @ApiProperty({ enum: [UserType.COACH, UserType.CLIENT], required: false })
  @IsOptional()
  @IsString()
  @IsIn([UserType.COACH, UserType.CLIENT])
  payerType?: UserType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  createdByID?: string;

  @ApiProperty({ enum: [UserType.COACH, UserType.ADMIN], required: false })
  @IsOptional()
  @IsString()
  @IsIn([UserType.COACH, UserType.ADMIN])
  createdByType?: UserType;

  @ApiProperty({
    enum: PaymentRequestType,
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentRequestType)
  type?: PaymentRequestType;

  @ApiProperty({
    enum: PaymentRequestFiltersStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentRequestFiltersStatus)
  status?: PaymentRequestFiltersStatus;

  @ApiProperty({ example: '2025-12-31T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  expiringBefore?: Date;
}
