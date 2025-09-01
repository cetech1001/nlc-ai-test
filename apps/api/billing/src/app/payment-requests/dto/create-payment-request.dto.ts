import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsNumber, IsDateString, IsObject, IsEnum, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {CreatePaymentRequestRequest, UserType} from '@nlc-ai/api-types';

export enum PaymentRequestType {
  PLAN_PAYMENT = 'plan_payment',
  COURSE_PAYMENT = 'course_payment',
  COMMUNITY_PAYMENT = 'community_payment',
  CUSTOM_PAYMENT = 'custom_payment'
}

export class CreatePaymentRequestDto implements CreatePaymentRequestRequest {
  @ApiProperty({ example: 'coach_123456789' })
  @IsString()
  @IsUUID()
  createdByID: string;

  @ApiProperty({ example: UserType.coach, enum: [UserType.coach, UserType.admin] })
  @IsString()
  @IsIn([UserType.coach, UserType.admin])
  createdByType: UserType;

  @ApiProperty({ example: 'coach_987654321' })
  @IsString()
  @IsUUID()
  payerID: string;

  @ApiProperty({ example: UserType.client, enum: [UserType.coach, UserType.client] })
  @IsString()
  @IsIn([UserType.coach, UserType.client])
  payerType: UserType;

  @ApiProperty({
    example: 'course_payment',
    enum: PaymentRequestType
  })
  @IsEnum(PaymentRequestType)
  type: PaymentRequestType;

  @ApiProperty({ example: 'plan_123456789', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  planID?: string;

  @ApiProperty({ example: 'course_123456789', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  courseID?: string;

  @ApiProperty({ example: 'community_123456789', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  communityID?: string;

  @ApiProperty({ example: 29999, description: 'Amount in cents' })
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
