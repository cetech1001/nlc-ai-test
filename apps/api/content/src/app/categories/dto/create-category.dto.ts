import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString, MaxLength, MinLength} from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({ example: 'Informative Content' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Educational and instructional content', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
