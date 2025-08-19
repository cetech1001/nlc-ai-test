import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject, IsUrl, IsUUID } from 'class-validator';
import { CommunityType, CommunityVisibility } from '@nlc-ai/api-types';

export class CreateCommunityDto {
  @ApiProperty({ description: 'Community name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Community description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CommunityType })
  @IsEnum(CommunityType)
  type: CommunityType;

  @ApiProperty({ enum: CommunityVisibility, required: false })
  @IsOptional()
  @IsEnum(CommunityVisibility)
  visibility?: CommunityVisibility;

  @ApiProperty({ description: 'Coach ID for coach-client communities', required: false })
  @IsOptional()
  @IsUUID()
  coachID?: string;

  @ApiProperty({ description: 'Course ID for course communities', required: false })
  @IsOptional()
  @IsUUID()
  courseID?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({ description: 'Banner URL', required: false })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @ApiProperty({ description: 'Community settings', required: false })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
