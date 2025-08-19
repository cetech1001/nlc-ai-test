import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from '@nlc-ai/api-dto';
import { MessageType } from '@nlc-ai/api-types';

export class MessageFiltersDto extends PaginationDto {
  @ApiProperty({ enum: MessageType, required: false })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({ description: 'Search in message content', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Messages before this date', required: false })
  @IsOptional()
  @IsDateString()
  before?: string;

  @ApiProperty({ description: 'Messages after this date', required: false })
  @IsOptional()
  @IsDateString()
  after?: string;
}
