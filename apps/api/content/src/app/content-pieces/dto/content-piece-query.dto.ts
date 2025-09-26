import {ApiProperty} from "@nestjs/swagger";
import {IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min} from "class-validator";
import {ContentStatus, ContentType} from "@nlc-ai/types";
import {Type} from "class-transformer";

export class ContentPieceQueryDto {
  @ApiProperty({ example: 1, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 10, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({ example: 'search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 'uuid-category-id', required: false })
  @IsOptional()
  @IsUUID()
  categoryID?: string;

  @ApiProperty({ enum: ContentType, required: false })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiProperty({ example: 'youtube', required: false })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiProperty({ enum: ContentStatus, required: false })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiProperty({ example: 'title', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ example: 'desc', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  publishedAfter?: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  publishedBefore?: string;
}
