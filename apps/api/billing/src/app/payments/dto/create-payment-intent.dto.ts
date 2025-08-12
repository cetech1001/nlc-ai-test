import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsOptional, IsString, IsUUID} from "class-validator";
import {CreatePaymentIntentRequest} from "@nlc-ai/types";

export class CreatePaymentIntentDto implements CreatePaymentIntentRequest {
  @ApiProperty({ example: 'coach_123456789' })
  @IsString()
  @IsUUID()
  coachID!: string;

  @ApiProperty({ example: 'plan_987654321' })
  @IsString()
  @IsUUID()
  planID!: string;

  @ApiProperty({ example: 5000, description: 'Amount in cents' })
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'Payment for Premium Coaching Plan', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'pm_1234567890abcdef', required: false })
  @IsOptional()
  @IsString()
  paymentMethodID?: string;
}
