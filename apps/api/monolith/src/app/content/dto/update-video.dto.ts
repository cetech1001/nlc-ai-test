import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsOptional, IsString, IsUUID, MaxLength} from "class-validator";
import {Transform} from "class-transformer";

export class UpdateVideoDto {
  @ApiProperty({ example: 'Updated Video Title', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiProperty({ example: 'Updated video description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-of-category', required: false })
  @IsOptional()
  @IsUUID()
  categoryID?: string;

  @ApiProperty({ example: ['fitness', 'tutorial', 'beginner'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  tags?: string[];

  @ApiProperty({ example: 'published', enum: ['draft', 'published', 'archived'], required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
