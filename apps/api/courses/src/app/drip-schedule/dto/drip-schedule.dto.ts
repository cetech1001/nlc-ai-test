import { IsBoolean, IsOptional, IsString, IsNumber, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DripInterval, UpdateDripSchedule } from "@nlc-ai/types";

export class LessonDripSettingDto {
  @ApiProperty({ description: 'Lesson ID' })
  @IsString()
  lessonID: string;

  @ApiProperty({ description: 'Number of days to delay' })
  @IsNumber()
  @Min(0)
  days: number;

  @ApiProperty({ description: 'Drip type', enum: ['course_start', 'previous_lesson'] })
  @IsEnum(['course_start', 'previous_lesson'])
  type: 'course_start' | 'previous_lesson';
}

export class UpdateLessonDripScheduleDto {
  @ApiProperty({ description: 'Lesson drip settings', type: [LessonDripSettingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonDripSettingDto)
  lessonSettings: LessonDripSettingDto[];
}

export class UpdateDripScheduleDto implements UpdateDripSchedule {
  @ApiProperty({ description: 'Enable drip content' })
  @IsBoolean()
  isDripEnabled: boolean;

  @ApiPropertyOptional({ description: 'Drip interval', enum: DripInterval })
  @IsOptional()
  @IsEnum(DripInterval)
  dripInterval?: DripInterval;

  @ApiPropertyOptional({ description: 'Number of lessons to release per interval' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  dripCount?: number;

  @ApiPropertyOptional({ description: 'Initial delay before first drip (days)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialDelay?: number;

  @ApiPropertyOptional({ description: 'Release all content at once on specific date' })
  @IsOptional()
  @IsString()
  releaseDate?: string;

  @ApiPropertyOptional({ description: 'Automatically unlock next chapter when previous is completed' })
  @IsOptional()
  @IsBoolean()
  autoUnlockChapters?: boolean;

  @ApiPropertyOptional({ description: 'Require completion percentage before unlocking next content' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  completionThreshold?: number;
}
