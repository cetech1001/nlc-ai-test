import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CourseLessonResponseDto {
  @ApiProperty({ description: 'Lesson ID' })
  id: string;

  @ApiProperty({ description: 'Chapter ID' })
  chapterID: string;

  @ApiProperty({ description: 'Lesson title' })
  title: string;

  @ApiPropertyOptional({ description: 'Lesson description' })
  description?: string;

  @ApiProperty({ description: 'Order index of the lesson' })
  orderIndex: number;

  @ApiProperty({ description: 'Lesson type (video, text, pdf, etc.)' })
  lessonType: string;

  @ApiPropertyOptional({ description: 'Lesson content' })
  content?: string;

  @ApiPropertyOptional({ description: 'Video URL' })
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Video duration in seconds' })
  videoDuration?: number;

  @ApiPropertyOptional({ description: 'PDF URL' })
  pdfUrl?: string;

  @ApiProperty({ description: 'Drip delay in days' })
  dripDelay: number;

  @ApiProperty({ description: 'Whether lesson is locked' })
  isLocked: boolean;

  @ApiProperty({ description: 'Estimated minutes to complete' })
  estimatedMinutes: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class CourseChapterResponseDto {
  @ApiProperty({ description: 'Chapter ID' })
  id: string;

  @ApiProperty({ description: 'Course ID' })
  courseID: string;

  @ApiProperty({ description: 'Chapter title' })
  title: string;

  @ApiPropertyOptional({ description: 'Chapter description' })
  description?: string;

  @ApiProperty({ description: 'Order index of the chapter' })
  orderIndex: number;

  @ApiProperty({ description: 'Drip delay in days' })
  dripDelay: number;

  @ApiProperty({ description: 'Whether chapter is locked' })
  isLocked: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Chapter lessons', type: [CourseLessonResponseDto] })
  lessons?: CourseLessonResponseDto[];
}

export class CourseResponseDto {
  @ApiProperty({ description: 'Course ID' })
  id: string;

  @ApiProperty({ description: 'Coach ID' })
  coachID: string;

  @ApiProperty({ description: 'Course title' })
  title: string;

  @ApiPropertyOptional({ description: 'Course description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Course category' })
  category?: string;

  @ApiPropertyOptional({ description: 'Difficulty level' })
  difficultyLevel?: string;

  @ApiProperty({ description: 'Pricing type' })
  pricingType: string;

  @ApiPropertyOptional({ description: 'One-time price in cents' })
  price?: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiPropertyOptional({ description: 'Installment count' })
  installmentCount?: number;

  @ApiPropertyOptional({ description: 'Installment amount in cents' })
  installmentAmount?: number;

  @ApiPropertyOptional({ description: 'Installment interval' })
  installmentInterval?: string;

  @ApiPropertyOptional({ description: 'Monthly price in cents' })
  monthlyPrice?: number;

  @ApiPropertyOptional({ description: 'Annual price in cents' })
  annualPrice?: number;

  @ApiPropertyOptional({ description: 'Course thumbnail URL' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Estimated duration in hours' })
  estimatedDurationHours?: number;

  @ApiProperty({ description: 'Total chapters count' })
  totalChapters: number;

  @ApiProperty({ description: 'Total lessons count' })
  totalLessons: number;

  @ApiProperty({ description: 'Total enrollments count' })
  totalEnrollments: number;

  @ApiProperty({ description: 'Active enrollments count' })
  activeEnrollments: number;

  @ApiProperty({ description: 'Completion rate percentage' })
  completionRate: number;

  @ApiProperty({ description: 'Is course active' })
  isActive: boolean;

  @ApiProperty({ description: 'Is course published' })
  isPublished: boolean;

  @ApiProperty({ description: 'Allow installments' })
  allowInstallments: boolean;

  @ApiProperty({ description: 'Allow subscriptions' })
  allowSubscriptions: boolean;

  @ApiProperty({ description: 'Enable drip content' })
  isDripEnabled: boolean;

  @ApiPropertyOptional({ description: 'Drip interval' })
  dripInterval?: string;

  @ApiPropertyOptional({ description: 'Drip count' })
  dripCount?: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Course chapters', type: [CourseChapterResponseDto] })
  chapters?: CourseChapterResponseDto[];
}

export class PaginatedCoursesResponseDto {
  @ApiProperty({ description: 'Array of courses', type: [CourseResponseDto] })
  data: CourseResponseDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class CourseStatsResponseDto {
  @ApiProperty({ description: 'Course ID' })
  courseID: string;

  @ApiProperty({ description: 'Total enrollments' })
  totalEnrollments: number;

  @ApiProperty({ description: 'Active enrollments' })
  activeEnrollments: number;

  @ApiProperty({ description: 'Completion rate' })
  completionRate: number;

  @ApiProperty({ description: 'Average progress percentage' })
  averageProgress: number;

  @ApiProperty({ description: 'Revenue generated' })
  totalRevenue: number;

  @ApiProperty({ description: 'Most popular chapter' })
  popularChapter?: {
    id: string;
    title: string;
    completionCount: number;
  };

  @ApiProperty({ description: 'Drop-off points' })
  dropOffPoints: Array<{
    chapterID: string;
    chapterTitle: string;
    dropOffRate: number;
  }>;
}
