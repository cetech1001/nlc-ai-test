import { IsString, IsOptional, IsArray, IsBoolean, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name', example: 'Welcome Email' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Template category', example: 'onboarding' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category: string;

  @ApiProperty({ description: 'Email subject template with variables', example: 'Welcome {{firstName}}!' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subjectTemplate: string;

  @ApiProperty({ description: 'Email body template with variables', example: 'Hi {{firstName}}, welcome to {{coachBusinessName}}!' })
  @IsString()
  @MinLength(1)
  bodyTemplate: string;

  @ApiProperty({ required: false, description: 'Template description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false, description: 'Template tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, description: 'Whether template was AI generated', default: false })
  @IsOptional()
  @IsBoolean()
  isAiGenerated?: boolean = false;

  @ApiProperty({ required: false, description: 'AI generation prompt if applicable' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  generationPrompt?: string;
}
