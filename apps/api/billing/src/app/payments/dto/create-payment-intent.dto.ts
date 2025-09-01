import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsOptional, IsString, IsUUID, IsIn} from "class-validator";
import {CreatePaymentIntentRequest} from "@nlc-ai/types";
import {UserType} from "@nlc-ai/api-types";

export class CreatePaymentIntentDto implements CreatePaymentIntentRequest {
  @ApiProperty({ example: 'coach_123456789' })
  @IsString()
  @IsUUID()
  payerID: string;

  @ApiProperty({ example: UserType.coach, enum: [UserType.coach, UserType.client] })
  @IsString()
  @IsIn([UserType.coach, UserType.client])
  payerType: UserType;

  @ApiProperty({ example: 'plan_987654321', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  planID?: string;

  @ApiProperty({ example: 'course_987654321', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  courseID?: string;

  @ApiProperty({ example: 'community_987654321', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  communityID?: string;

  @ApiProperty({ example: 5000, description: 'Amount in cents' })
  @IsNumber()
  amount: number;

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
