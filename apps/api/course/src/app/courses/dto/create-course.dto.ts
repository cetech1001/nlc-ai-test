import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PricingType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
  INSTALLMENT = 'installment'
}

export class CreateCourseChapterDto {
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

  @ApiPropertyOptional({ description: 'Chapter lessons', type: [Object] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCourseLessonDto)
  lessons?: CreateCourseLessonDto[];
}

export class CreateCourseLessonDto {
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

  @ApiProperty({ description: 'Lesson type (video, text, pdf, etc.)' })
  @IsString()
  lessonType: string;

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

  @ApiPropertyOptional({ description: 'Drip delay in days', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dripDelay?: number;

  @ApiPropertyOptional({ description: 'Whether lesson is locked', default: false })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Estimated minutes to complete' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedMinutes?: number;
}

export class CreateCourseDto {
  @ApiProperty({ description: 'Course title' })
  @IsString()
  title: string;

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

  @ApiProperty({ description: 'Pricing type', enum: PricingType })
  @IsEnum(PricingType)
  pricingType: PricingType;

  @ApiPropertyOptional({ description: 'One-time price in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Currency', default: 'USD' })
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

  @ApiPropertyOptional({ description: 'Allow installments', default: false })
  @IsOptional()
  @IsBoolean()
  allowInstallments?: boolean;

  @ApiPropertyOptional({ description: 'Allow subscriptions', default: false })
  @IsOptional()
  @IsBoolean()
  allowSubscriptions?: boolean;

  @ApiPropertyOptional({ description: 'Enable drip content', default: false })
  @IsOptional()
  @IsBoolean()
  isDripEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Is course active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Drip interval (daily, weekly)' })
  @IsOptional()
  @IsString()
  dripInterval?: string;

  @ApiPropertyOptional({ description: 'Drip count' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  dripCount?: number;

  @ApiPropertyOptional({ description: 'Course chapters', type: [CreateCourseChapterDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCourseChapterDto)
  chapters?: CreateCourseChapterDto[];
}
