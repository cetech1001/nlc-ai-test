import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '@nlc-ai/api-dto';
import { PostType } from '@nlc-ai/api-types';

export class PostFiltersDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  communityID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  authorID?: string;

  @ApiProperty({ enum: PostType, required: false })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPinned?: boolean;

  @ApiProperty({ enum: ['asc', 'desc'], required: false })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
