import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from '@nlc-ai/api-dto';
import { UserType, MemberRole, MemberStatus } from '@nlc-ai/types';

export class CommunityMemberFiltersDto extends PaginationDto {
  @ApiProperty({ enum: MemberRole, required: false })
  @IsOptional()
  @IsEnum(MemberRole)
  role?: MemberRole;

  @ApiProperty({ enum: MemberStatus, required: false })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiProperty({ enum: UserType, required: false })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter members who joined after this date' })
  @IsOptional()
  @IsDateString()
  joinedDateStart?: string;

  @ApiProperty({ required: false, description: 'Filter members who joined before this date' })
  @IsOptional()
  @IsDateString()
  joinedDateEnd?: string;

  @ApiProperty({ required: false, description: 'Filter members who were last active after this date' })
  @IsOptional()
  @IsDateString()
  lastActiveDateStart?: string;

  @ApiProperty({ required: false, description: 'Filter members who were last active before this date' })
  @IsOptional()
  @IsDateString()
  lastActiveDateEnd?: string;
}
