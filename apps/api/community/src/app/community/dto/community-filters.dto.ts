import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '@nlc-ai/api-dto';
import { CommunityType, CommunityVisibility } from '@nlc-ai/api-types';

export class CommunityFiltersDto extends PaginationDto {
  @ApiProperty({ enum: CommunityType, required: false })
  @IsOptional()
  @IsEnum(CommunityType)
  type?: CommunityType;

  @ApiProperty({ enum: CommunityVisibility, required: false })
  @IsOptional()
  @IsEnum(CommunityVisibility)
  visibility?: CommunityVisibility;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  coachID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter communities user is a member of', required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  memberOf?: boolean;
}
