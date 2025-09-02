import {ApiProperty} from "@nestjs/swagger";
import {IsIn, IsString, IsUUID} from "class-validator";
import {CreateSetupIntentRequest} from "@nlc-ai/types";
import {UserType} from "@nlc-ai/api-types";

export class CreateSetupIntentDto implements CreateSetupIntentRequest {
  @ApiProperty({ example: 'coach_123456789' })
  @IsString()
  @IsUUID()
  payerID: string;

  @ApiProperty({ example: UserType.coach, enum: [UserType.coach, UserType.client] })
  @IsString()
  @IsIn([UserType.coach, UserType.client])
  payerType: UserType;
}
