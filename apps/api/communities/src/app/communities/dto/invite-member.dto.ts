import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserType, MemberRole } from '@nlc-ai/api-types';

export class InviteMemberDto {
  @ApiProperty()
  @IsUUID()
  userID: string;

  @ApiProperty({ enum: UserType })
  @IsEnum(UserType)
  userType: UserType;

  @ApiProperty({ enum: MemberRole, required: false })
  @IsOptional()
  @IsEnum(MemberRole)
  role?: MemberRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
