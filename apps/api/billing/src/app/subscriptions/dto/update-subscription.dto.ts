import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { Transform, Type } from "class-transformer";
import { BillingCycle, SubscriptionStatus } from '@prisma/client';
import { UpdateSubscriptionRequest } from '@nlc-ai/api-types';

export class UpdateSubscriptionDto implements UpdateSubscriptionRequest {
  @ApiProperty({ example: 'plan_123456789', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  planID?: string;

  @ApiProperty({ example: 'community_123456789', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  communityID?: string;

  @ApiProperty({ example: 'course_123456789', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  courseID?: string;

  @ApiProperty({ enum: BillingCycle, required: false })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @ApiProperty({ example: 2999, required: false, description: 'Subscription amount in cents' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amount?: number;

  @ApiProperty({ enum: SubscriptionStatus, required: false })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiProperty({ example: 'Customer requested cancellation', required: false })
  @IsOptional()
  @IsString()
  cancelReason?: string;

  @ApiProperty({ example: '2025-09-12T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }: { value: string }) => value ? new Date(value) : undefined)
  nextBillingDate?: Date;
}
