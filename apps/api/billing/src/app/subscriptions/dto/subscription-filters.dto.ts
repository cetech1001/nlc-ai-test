import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsDateString } from 'class-validator';
import {Transform} from "class-transformer";
import { BillingCycle, SubscriptionStatus } from '@prisma/client';
import { SubscriptionFilters } from '@nlc-ai/api-types';

export class SubscriptionFiltersDto implements SubscriptionFilters {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  coachID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  planID?: string;

  @ApiProperty({ enum: SubscriptionStatus, required: false })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiProperty({ enum: BillingCycle, required: false })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @ApiProperty({ example: '2025-12-31T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  expiringBefore?: Date;

  @ApiProperty({ example: '2025-08-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  createdAfter?: Date;
}
