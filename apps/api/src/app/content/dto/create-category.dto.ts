import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Fitness Tips' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Educational fitness content', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
