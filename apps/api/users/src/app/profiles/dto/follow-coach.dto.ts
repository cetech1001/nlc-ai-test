import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FollowCoachDto {
  @ApiProperty({ example: 'uuid-of-coach' })
  @IsString()
  @IsUUID()
  coachID: string;
}
