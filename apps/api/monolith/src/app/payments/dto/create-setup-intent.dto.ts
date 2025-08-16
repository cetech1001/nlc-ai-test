import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";
import {CreateSetupIntentRequest} from "@nlc-ai/types";

export class CreateSetupIntentDto implements CreateSetupIntentRequest {
  @ApiProperty({ example: 'cus_1234567890abcdef' })
  @IsString()
  customerID: string;
}
