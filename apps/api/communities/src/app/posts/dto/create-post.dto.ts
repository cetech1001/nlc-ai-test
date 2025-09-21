import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsUrl, IsObject, MaxLength } from 'class-validator';
import { PostType } from '@nlc-ai/api-types';

export class CreatePostDto {
  @ApiProperty({ enum: PostType, required: false })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @ApiProperty({ description: 'Post content' })
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiProperty({ description: 'Media URLs', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  mediaUrls?: string[];

  @ApiProperty({ description: 'Link URL for link posts', required: false })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({ description: 'Link preview data', required: false })
  @IsOptional()
  @IsObject()
  linkPreview?: Record<string, any>;

  @ApiProperty({ description: 'Poll options', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pollOptions?: string[];

  @ApiProperty({ description: 'Event data for event posts', required: false })
  @IsOptional()
  @IsObject()
  eventData?: Record<string, any>;
}
