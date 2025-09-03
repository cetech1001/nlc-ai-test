import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CourseStructureRequestDto {
  @ApiProperty({
    description: 'Description of the course the user wants to create',
    example: 'I want to create a comprehensive course on digital marketing for beginners. It should cover social media marketing, email marketing, SEO basics, and content creation strategies.',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Target audience for the course',
    example: 'Small business owners with no prior marketing experience',
  })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional({
    description: 'Desired course difficulty level',
    example: 'beginner',
  })
  @IsOptional()
  @IsString()
  difficultyLevel?: string;

  @ApiPropertyOptional({
    description: 'Estimated course duration preference',
    example: '4-6 weeks',
  })
  @IsOptional()
  @IsString()
  estimatedDuration?: string;
}
