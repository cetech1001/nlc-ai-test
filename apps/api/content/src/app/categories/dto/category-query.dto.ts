import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString} from "class-validator";

export class CategoryQueryDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  limit?: number;

  @ApiProperty({ example: 'search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 'name', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ example: 'asc', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
