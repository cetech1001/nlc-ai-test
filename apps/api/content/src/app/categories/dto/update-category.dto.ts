import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString, MaxLength, MinLength} from "class-validator";

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Updated Category Name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
