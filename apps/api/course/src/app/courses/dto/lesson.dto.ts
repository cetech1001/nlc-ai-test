import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  PDF = 'pdf',
  AUDIO = 'audio',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment'
}

export class CreateLessonDto {
  @ApiProperty({ description: 'Lesson title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Lesson description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Order index of the lesson' })
  @IsNumber()
  @Min(0)
  orderIndex: number;

  @ApiProperty({ description: 'Lesson type', enum: LessonType })
  @IsEnum(LessonType)
  lessonType: LessonType;

  @ApiPropertyOptional({ description: 'Lesson content (for text lessons)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Video URL' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Video duration in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  videoDuration?: number;

  @ApiPropertyOptional({ description: 'PDF URL' })
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional({ description: 'Audio URL' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Drip delay in days', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dripDelay?: number;

  @ApiPropertyOptional({ description: 'Whether lesson is locked', default: false })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Is this a preview lesson (free access)', default: false })
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;

  @ApiPropertyOptional({ description: 'Estimated minutes to complete' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedMinutes?: number;

  @ApiPropertyOptional({ description: 'Additional resources/downloads' })
  @IsOptional()
  downloads?: Array<{
    title: string;
    url: string;
    fileType: string;
  }>;
}

export class UpdateLessonDto {
  @ApiPropertyOptional({ description: 'Lesson title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Lesson description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Order index of the lesson' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({ description: 'Lesson type', enum: LessonType })
  @IsOptional()
  @IsEnum(LessonType)
  lessonType?: LessonType;

  @ApiPropertyOptional({ description: 'Lesson content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Video URL' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Video duration in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  videoDuration?: number;

  @ApiPropertyOptional({ description: 'PDF URL' })
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional({ description: 'Audio URL' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Drip delay in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dripDelay?: number;

  @ApiPropertyOptional({ description: 'Whether lesson is locked' })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Is this a preview lesson' })
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;

  @ApiPropertyOptional({ description: 'Estimated minutes to complete' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedMinutes?: number;

  @ApiPropertyOptional({ description: 'Additional resources/downloads' })
  @IsOptional()
  downloads?: Array<{
    title: string;
    url: string;
    fileType: string;
  }>;
}

export class ReorderLessonsDto {
  @ApiProperty({ description: 'Array of lesson IDs in new order' })
  @IsString({ each: true })
  lessonIDs: string[];
}
