import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {CreateCourseChapter, UpdateCourseChapter} from "@nlc-ai/types";

export class CreateChapterDto implements CreateCourseChapter{
  @ApiProperty({ description: 'Chapter title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Chapter description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Order index of the chapter' })
  @IsNumber()
  @Min(0)
  orderIndex: number;

  @ApiPropertyOptional({ description: 'Drip delay in days', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dripDelay?: number;

  @ApiPropertyOptional({ description: 'Whether chapter is locked', default: false })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;
}

export class UpdateChapterDto implements UpdateCourseChapter{
  @ApiPropertyOptional({ description: 'Chapter title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Chapter description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Order index of the chapter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({ description: 'Drip delay in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dripDelay?: number;

  @ApiPropertyOptional({ description: 'Whether chapter is locked' })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;
}

export class ReorderChaptersDto {
  @ApiProperty({ description: 'Array of chapter IDs in new order' })
  @IsString({ each: true })
  chapterIDs: string[];
}
