import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReactionType } from '@nlc-ai/api-types';

export class ReactToCommentDto {
  @ApiProperty({ enum: ReactionType })
  @IsEnum(ReactionType)
  type: ReactionType;
}
