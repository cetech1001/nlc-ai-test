import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsOptional, IsString, Min} from "class-validator";
import {Type} from "class-transformer";

export class CategoryQueryDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
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
