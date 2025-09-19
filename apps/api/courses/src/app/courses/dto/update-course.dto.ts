import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PricingType } from './create-course.dto';

export class UpdateCourseDto {
  @ApiPropertyOptional({ description: 'Course title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Course description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Course category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Difficulty level' })
  @IsOptional()
  @IsString()
  difficultyLevel?: string;

  @ApiPropertyOptional({ description: 'Pricing type', enum: PricingType })
  @IsOptional()
  @IsEnum(PricingType)
  pricingType?: PricingType;

  @ApiPropertyOptional({ description: 'One-time price in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Installment count' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  installmentCount?: number;

  @ApiPropertyOptional({ description: 'Installment amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  installmentAmount?: number;

  @ApiPropertyOptional({ description: 'Installment interval (weekly, monthly)' })
  @IsOptional()
  @IsString()
  installmentInterval?: string;

  @ApiPropertyOptional({ description: 'Monthly price in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyPrice?: number;

  @ApiPropertyOptional({ description: 'Annual price in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualPrice?: number;

  @ApiPropertyOptional({ description: 'Course thumbnail URL' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Estimated duration in hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDurationHours?: number;

  @ApiPropertyOptional({ description: 'Is course active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Is course published' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Allow installments' })
  @IsOptional()
  @IsBoolean()
  allowInstallments?: boolean;

  @ApiPropertyOptional({ description: 'Allow subscriptions' })
  @IsOptional()
  @IsBoolean()
  allowSubscriptions?: boolean;

  @ApiPropertyOptional({ description: 'Enable drip content' })
  @IsOptional()
  @IsBoolean()
  isDripEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Drip interval (daily, weekly)' })
  @IsOptional()
  @IsString()
  dripInterval?: string;

  @ApiPropertyOptional({ description: 'Drip count' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  dripCount?: number;
}

export class UpdateCourseChapterDto {
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

export class UpdateCourseLessonDto {
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

  @ApiPropertyOptional({ description: 'Lesson type (video, text, pdf, etc.)' })
  @IsOptional()
  @IsString()
  lessonType?: string;

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

  @ApiPropertyOptional({ description: 'Drip delay in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dripDelay?: number;

  @ApiPropertyOptional({ description: 'Whether lesson is locked' })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Estimated minutes to complete' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedMinutes?: number;
}
