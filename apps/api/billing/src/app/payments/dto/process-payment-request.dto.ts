import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsOptional, IsString, IsUUID} from "class-validator";
import {ProcessPaymentRequest} from "@nlc-ai/types";

export class ProcessPaymentRequestDto implements ProcessPaymentRequest {
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

  @ApiProperty({ example: 'pm_1234567890abcdef' })
  @IsString()
  paymentMethodID!: string;

  @ApiProperty({ example: 'Payment for Premium Coaching Plan', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
