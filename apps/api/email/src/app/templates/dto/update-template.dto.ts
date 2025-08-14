import { IsString, IsOptional, IsArray, IsBoolean, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTemplateDto {
  @ApiProperty({ required: false, description: 'Template name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false, description: 'Template category' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category?: string;

  @ApiProperty({ required: false, description: 'Email subject template' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subjectTemplate?: string;

  @ApiProperty({ required: false, description: 'Email body template' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  bodyTemplate?: string;

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

  @ApiProperty({ required: false, description: 'Whether template is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
