import {ApiProperty} from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength
} from "class-validator";
import {ContentStatus, ContentType} from "@nlc-ai/types";

export class UpdateContentPieceDto {
  @ApiProperty({ example: 'Updated Title', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title?: string;

  @ApiProperty({ example: 'uuid-category-id', required: false })
  @IsOptional()
  @IsUUID()
  categoryID?: string;

  @ApiProperty({ enum: ContentType, required: false })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['updated', 'tags'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'https://new-thumbnail.jpg', required: false })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiProperty({ enum: ContentStatus, required: false })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
