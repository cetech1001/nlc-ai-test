import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsOptional, IsString, IsUUID, IsIn} from "class-validator";
import {ProcessPaymentRequest} from "@nlc-ai/types";
import {UserType} from "@nlc-ai/api-types";

export class ProcessPaymentRequestDto implements ProcessPaymentRequest {
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

  @ApiProperty({ example: 'pm_1234567890abcdef' })
  @IsString()
  paymentMethodID: string;

  @ApiProperty({ example: 'Payment for Premium Coaching Plan', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
