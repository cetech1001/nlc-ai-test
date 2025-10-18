import {IsOptional, IsString, IsUUID} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {CoachRegisterDto} from "./coach-auth.dto";
import {GoogleAuthDto} from "./common.dto";
import {
  ClientGoogleAuthRequest,
  ClientRegistrationRequest,
  SwitchCoachContextRequest
} from "@nlc-ai/types";

export class ClientRegisterDto extends CoachRegisterDto implements ClientRegistrationRequest{
  @ApiProperty({ example: 'invite-token-uuid' })
  @IsString()
  @IsUUID()
  inviteToken: string;
}

export class ClientGoogleAuthDto extends GoogleAuthDto implements ClientGoogleAuthRequest{
  @ApiProperty({ example: 'invite-token-uuid', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  inviteToken?: string;
}

export class SwitchCoachContextDto implements SwitchCoachContextRequest{
  @ApiProperty({ example: 'coach-uuid' })
  @IsString()
  @IsUUID()
  coachID: string;
}
