import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUrl, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  @MaxLength(2000)
  content: string;

  @ApiProperty({ description: 'Post ID for post comments', required: false })
  @IsOptional()
  @IsUUID()
  postID: string;

  @ApiProperty({ description: 'Media URLs', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  mediaUrls?: string[];

  @ApiProperty({ description: 'Parent comment ID for replies', required: false })
  @IsOptional()
  @IsUUID()
  parentCommentID?: string;
}
