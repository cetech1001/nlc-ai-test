import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsDateString, IsIn } from 'class-validator';
import { Transform } from "class-transformer";
import {PaymentRequestFilters, UserType} from '@nlc-ai/api-types';
import {PaymentRequestStatus, PaymentRequestType} from "@prisma/client";

export class PaymentRequestFiltersDto implements PaymentRequestFilters {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  payerID?: string;

  @ApiProperty({ enum: [UserType.coach, UserType.client], required: false })
  @IsOptional()
  @IsString()
  @IsIn([UserType.coach, UserType.client])
  payerType?: UserType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  createdByID?: string;

  @ApiProperty({ enum: [UserType.coach, UserType.admin], required: false })
  @IsOptional()
  @IsString()
  @IsIn([UserType.coach, UserType.admin])
  createdByType?: UserType;

  @ApiProperty({
    enum: PaymentRequestType,
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentRequestType)
  type?: PaymentRequestType;

  @ApiProperty({
    enum: PaymentRequestStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentRequestStatus)
  status?: PaymentRequestStatus;

  @ApiProperty({ example: '2025-12-31T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  expiringBefore?: Date;
}
