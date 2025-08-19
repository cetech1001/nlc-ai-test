import { ApiProperty } from '@nestjs/swagger';
import {IsOptional, IsString, IsArray, IsBoolean, IsObject} from 'class-validator';
import { Transform } from 'class-transformer';

export enum ResourceType {
  IMAGE = 'image',
  VIDEO = 'video',
  RAW = 'raw'
}

export class TransformationDto {
  @ApiProperty({ enum: ['resize', 'crop', 'quality', 'format', 'rotate', 'effect'] })
  @IsString()
  type: "resize" | "crop" | "quality" | "format" | "rotate" | "effect";

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  width?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  height?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  quality?: number | 'auto';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiProperty({ required: false, enum: ['fit', 'fill', 'scale', 'crop'] })
  @IsOptional()
  @IsString()
  crop?: "crop" | "fit" | "fill" | "scale";

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gravity?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  angle?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  effect?: string;
}

export class UploadAssetDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  publicID?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  overwrite?: boolean = false;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @Transform(({ value }) => !Array.isArray(value) ? [value] : value)
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, type: Object, additionalProperties: true })
  @IsOptional()
  @Transform(({ value }) => {
    // Handle FormData JSON string
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.warn('Failed to parse metadata JSON:', value, error);
        return {}; // Return empty object if parsing fails
      }
    }
    // Handle direct object
    return value || {};
  })
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ required: false, type: [TransformationDto] })
  @IsOptional()
  @IsArray()
  transformation?: TransformationDto[];
}
