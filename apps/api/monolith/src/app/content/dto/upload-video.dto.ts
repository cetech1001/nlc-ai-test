import { IsString, IsOptional, IsUUID, IsArray, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UploadVideoDto {
  @ApiProperty({ example: 'uuid-of-category' })
  @IsUUID()
  categoryID: string;

  @ApiProperty({ example: 'My Awesome Video' })
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiProperty({ example: 'This is a description of my video', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['fitness', 'tutorial'], required: false })
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
}
