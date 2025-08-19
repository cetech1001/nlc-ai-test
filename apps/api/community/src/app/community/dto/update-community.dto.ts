import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject, IsUrl, IsBoolean } from 'class-validator';
import { CommunityVisibility } from '@nlc-ai/api-types';

export class UpdateCommunityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CommunityVisibility, required: false })
  @IsOptional()
  @IsEnum(CommunityVisibility)
  visibility?: CommunityVisibility;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
