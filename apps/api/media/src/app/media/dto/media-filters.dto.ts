import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '@nlc-ai/api-dto';

export enum MediaResourceType {
  IMAGE = 'image',
  VIDEO = 'video',
  RAW = 'raw'
}

export class MediaFiltersDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coachID?: string;

  @ApiProperty({ required: false, enum: MediaResourceType })
  @IsOptional()
  @IsEnum(MediaResourceType)
  resourceType?: MediaResourceType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  endDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  minSize?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  maxSize?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiProperty({ required: false, enum: ['name', 'date', 'size'], default: 'date' })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'date' | 'size' = 'date';

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
