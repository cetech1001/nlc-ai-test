import {ApiProperty} from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  MinLength
} from "class-validator";
import {ContentStatus, ContentType} from "@nlc-ai/types";

export class CreateContentPieceDto {
  @ApiProperty({ example: 'How to Build Muscle Fast' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiProperty({ example: 'uuid-category-id' })
  @IsUUID()
  categoryID: string;

  @ApiProperty({ enum: ContentType, example: ContentType.VIDEO })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty({ example: 'youtube', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  platform?: string;

  @ApiProperty({ example: 'ABC123XYZ', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  platformID?: string;

  @ApiProperty({ example: 'https://youtube.com/watch?v=123', required: false })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({ example: 'Comprehensive guide on muscle building', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['fitness', 'muscle', 'workout'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'https://img.youtube.com/vi/123/hqdefault.jpg', required: false })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiProperty({ example: 600, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @ApiProperty({ enum: ContentStatus, example: ContentStatus.PUBLISHED, required: false })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
