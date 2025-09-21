import {ApiProperty} from "@nestjs/swagger";
import {PaginationDto} from "@nlc-ai/api-dto";
import {IsEnum, IsOptional, IsString, IsUUID} from "class-validator";

export class CommentFiltersDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  parentCommentID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  postID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: ['asc', 'desc'], required: false, default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
