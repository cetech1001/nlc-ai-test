import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsArray, ValidateNested} from "class-validator";
import {Type} from "class-transformer";

export class SuggestedLessonDto {
  @ApiProperty({ description: 'Suggested lesson title' })
  title: string;

  @ApiProperty({ description: 'Lesson description' })
  description: string;

  @ApiProperty({ description: 'Suggested lesson type' })
  lessonType: string;

  @ApiProperty({ description: 'Estimated duration in minutes' })
  estimatedMinutes: number;

  @ApiProperty({ description: 'Order index within the chapter' })
  orderIndex: number;

  @ApiPropertyOptional({ description: 'Key learning objectives' })
  learningObjectives?: string[];

  @ApiPropertyOptional({ description: 'Suggested content outline' })
  contentOutline?: string[];
}

export class SuggestedChapterDto {
  @ApiProperty({ description: 'Suggested chapter title' })
  title: string;

  @ApiProperty({ description: 'Chapter description' })
  description: string;

  @ApiProperty({ description: 'Order index of the chapter' })
  orderIndex: number;

  @ApiProperty({ description: 'Estimated chapter duration in hours' })
  estimatedDurationHours: number;

  @ApiProperty({ description: 'Chapter learning goals' })
  learningGoals: string[];

  @ApiProperty({ description: 'Suggested lessons for this chapter', type: [SuggestedLessonDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SuggestedLessonDto)
  lessons: SuggestedLessonDto[];
}

export class CourseStructureSuggestionDto {
  @ApiProperty({ description: 'Suggested course title' })
  courseTitle: string;

  @ApiProperty({ description: 'Suggested course description' })
  courseDescription: string;

  @ApiProperty({ description: 'Recommended difficulty level' })
  recommendedDifficulty: string;

  @ApiProperty({ description: 'Suggested course category' })
  suggestedCategory: string;

  @ApiProperty({ description: 'Estimated total course duration in hours' })
  estimatedTotalHours: number;

  @ApiProperty({ description: 'Target audience description' })
  targetAudience: string;

  @ApiProperty({ description: 'Key learning outcomes for the entire course' })
  learningOutcomes: string[];

  @ApiProperty({ description: 'Prerequisites for taking this course' })
  prerequisites: string[];

  @ApiProperty({ description: 'Suggested course structure with chapters', type: [SuggestedChapterDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SuggestedChapterDto)
  suggestedChapters: SuggestedChapterDto[];

  @ApiProperty({ description: 'Additional recommendations for course success' })
  recommendations: string[];

  @ApiPropertyOptional({ description: 'Suggested pricing strategy' })
  pricingGuidance?: {
    suggestedPriceRange: string;
    pricingRationale: string;
    monetizationTips: string[];
  };
}
