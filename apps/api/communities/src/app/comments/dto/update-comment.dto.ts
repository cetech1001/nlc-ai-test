import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUrl, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ description: 'Comment content', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @ApiProperty({ description: 'Media URLs', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  mediaUrls?: string[];
}
