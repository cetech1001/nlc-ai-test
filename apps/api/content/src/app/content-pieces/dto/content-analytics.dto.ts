import {ApiProperty} from "@nestjs/swagger";
import {IsEnum, IsOptional, IsString, IsUUID} from "class-validator";
import {ContentType} from "@nlc-ai/types";

export class ContentAnalyticsDto {
  @ApiProperty({ example: 'month', required: false })
  @IsOptional()
  @IsString()
  period?: 'week' | 'month' | 'quarter' | 'year';

  @ApiProperty({ example: 'uuid-category-id', required: false })
  @IsOptional()
  @IsUUID()
  categoryID?: string;

  @ApiProperty({ enum: ContentType, required: false })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;
}
