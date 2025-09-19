import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUrl, IsObject, MaxLength, IsBoolean } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  mediaUrls?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  linkPreview?: Record<string, any>;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pollOptions?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  eventData?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
