import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ViolationType } from '@nlc-ai/api-types';

export class ReportContentDto {
  @ApiProperty({ description: 'ID of the content being reported' })
  @IsUUID()
  contentID: string;

  @ApiProperty({
    enum: ['post', 'comment', 'message'],
    description: 'Type of content being reported'
  })
  @IsString()
  @IsIn(['post', 'comment', 'message'])
  contentType: 'post' | 'comment' | 'message';

  @ApiProperty({ enum: ViolationType, description: 'Primary violation type' })
  @IsEnum(ViolationType)
  reason: ViolationType;

  @ApiProperty({ required: false, description: 'Additional details about the report' })
  @IsOptional()
  @IsString()
  details?: string;
}
