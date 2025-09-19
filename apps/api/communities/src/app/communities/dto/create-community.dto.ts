import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsEnum, IsUrl, IsUUID, Length, IsBoolean, IsInt, Min, ValidateNested, IsIn, Max, Matches
} from 'class-validator';
import { Type } from 'class-transformer';
import {CommunityPricingType, CommunityType, CommunityVisibility} from '@nlc-ai/api-types';

class CommunityPricingDto {
  @ApiProperty({ enum: CommunityPricingType, description: 'Pricing model for the community' })
  @IsEnum(CommunityPricingType)
  type: CommunityPricingType;

  @ApiProperty({ description: 'Price in cents', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  amount?: number;

  @ApiProperty({ description: 'Currency code', required: false, default: 'USD' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
}

class CommunitySettingsDto {
  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  allowMemberPosts?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  allowFileUploads?: boolean;

  @ApiProperty({ required: false, default: 5000, minimum: 100, maximum: 10000 })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(10000)
  maxPostLength?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  allowPolls?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  allowEvents?: boolean;

  @ApiProperty({ enum: ['strict', 'moderate', 'relaxed'], required: false, default: 'moderate' })
  @IsOptional()
  @IsIn(['strict', 'moderate', 'relaxed'])
  moderationLevel?: 'strict' | 'moderate' | 'relaxed';
}

export class CreateCommunityDto {
  @ApiProperty({ description: 'Community name' })
  @IsString()
  @Length(3, 255)
  name: string;

  @ApiProperty({ description: 'Community description', required: false })
  @IsOptional()
  @IsString()
  @Length(10, 2000)
  description?: string;

  @ApiProperty({ description: 'URL slug for SEO-friendly URLs' })
  @IsString()
  @Length(3, 100)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' })
  slug: string;

  @ApiProperty({ enum: CommunityType })
  @IsEnum(CommunityType)
  type: CommunityType;

  @ApiProperty({ enum: CommunityVisibility, required: false, default: CommunityVisibility.PRIVATE })
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

  @ApiProperty({ description: 'Community pricing configuration', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CommunityPricingDto)
  pricing?: CommunityPricingDto;

  @ApiProperty({ description: 'Community settings', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CommunitySettingsDto)
  settings?: CommunitySettingsDto;

  @ApiProperty({ description: 'System-created community (admin only)', required: false })
  @IsOptional()
  @IsBoolean()
  isSystemCreated?: boolean;
}
