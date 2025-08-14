import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {CoachRegisterDto} from "./coach-auth.dto";
import {GoogleAuthDto} from "./common.dto";

export class ClientRegisterDto extends CoachRegisterDto{
  @ApiProperty({ example: 'invite-token-uuid' })
  @IsString()
  @IsUUID()
  inviteToken: string;
}

export class ClientGoogleAuthDto extends GoogleAuthDto{
  @ApiProperty({ example: 'invite-token-uuid' })
  @IsString()
  @IsUUID()
  inviteToken: string;
}

export class SwitchCoachContextDto {
  @ApiProperty({ example: 'coach-uuid' })
  @IsString()
  @IsUUID()
  coachID: string;
}
