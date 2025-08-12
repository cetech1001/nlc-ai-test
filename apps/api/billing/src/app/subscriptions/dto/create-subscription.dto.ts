import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsOptional, IsNumber, IsDateString, Min, Max } from 'class-validator';
import {Type, Transform} from "class-transformer";
import { BillingCycle } from '@prisma/client';
import { CreateSubscriptionRequest } from '@nlc-ai/api-types';

export class CreateSubscriptionDto implements CreateSubscriptionRequest {
  @ApiProperty({ example: 'coach_123456789' })
  @IsString()
  @IsUUID()
  coachID: string;

  @ApiProperty({ example: 'plan_123456789' })
  @IsString()
  @IsUUID()
  planID: string;

  @ApiProperty({ enum: BillingCycle })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiProperty({ example: 14, required: false, description: 'Trial period in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  @Type(() => Number)
  trialDays?: number;

  @ApiProperty({ example: '2025-08-12T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  currentPeriodStart?: Date;

  @ApiProperty({ example: '2025-09-12T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  currentPeriodEnd?: Date;
}
