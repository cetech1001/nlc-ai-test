import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString, IsUrl} from "class-validator";
import {SendPaymentRequest} from "@nlc-ai/types";
import {CreatePaymentIntentDto} from "./create-payment-intent.dto";

export class SendPaymentRequestDto extends CreatePaymentIntentDto implements SendPaymentRequest {
  @ApiProperty({ example: 'https://payment.stripe.com/plink_abc123', required: false })
  @IsOptional()
  @IsUrl()
  paymentLink?: string;

  @ApiProperty({ example: 'link_123456789', required: false })
  @IsOptional()
  @IsString()
  linkID?: string;
}
