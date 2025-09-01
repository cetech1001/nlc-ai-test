import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsDateString, IsIn } from 'class-validator';
import { Transform } from "class-transformer";
import { BillingCycle, SubscriptionStatus } from '@prisma/client';
import {SubscriptionFilters, UserType} from '@nlc-ai/api-types';

export class SubscriptionFiltersDto implements SubscriptionFilters {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  subscriberID?: string;

  @ApiProperty({ enum: [UserType.coach, UserType.client], required: false })
  @IsOptional()
  @IsString()
  @IsIn([UserType.coach, UserType.client])
  subscriberType?: UserType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  planID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  communityID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  courseID?: string;

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
