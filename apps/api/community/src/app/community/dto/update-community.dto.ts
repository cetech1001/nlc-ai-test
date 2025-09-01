import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject, IsUrl, IsBoolean } from 'class-validator';
import { CommunityVisibility, CommunityPricingType } from '@nlc-ai/api-types';

class CommunityPricingDto {
  @ApiProperty({ enum: CommunityPricingType, description: 'Pricing model for the community' })
  @IsEnum(CommunityPricingType)
  type: CommunityPricingType;

  @ApiProperty({ description: 'Price amount', required: false })
  @IsOptional()
  amount?: number;

  @ApiProperty({ description: 'Currency code', required: false, default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

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

  @ApiProperty({ description: 'Community pricing configuration', required: false })
  @IsOptional()
  pricing?: CommunityPricingDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
