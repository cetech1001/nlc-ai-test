import {IsOptional, IsString, IsDateString, IsNumberString, IsUUID, IsInt} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClientQueryParams } from '@nlc-ai/types';
import {Transform} from "class-transformer";

export class ClientQueryDto implements ClientQueryParams {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(v => +v.value)
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Transform(v => +v.value)
  @IsInt()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by client status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Search query for name, email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by minimum courses bought' })
  @IsOptional()
  @IsNumberString()
  coursesBought?: string;

  @ApiPropertyOptional({ description: 'Filter by date joined start (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateJoinedStart?: string;

  @ApiPropertyOptional({ description: 'Filter by date joined end (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateJoinedEnd?: string;

  @ApiPropertyOptional({ description: 'Filter by last interaction start (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  lastInteractionStart?: string;

  @ApiPropertyOptional({ description: 'Filter by last interaction end (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  lastInteractionEnd?: string;

  @ApiPropertyOptional({ description: 'Filter by coach ID (admin only)' })
  @IsOptional()
  @IsUUID()
  coachID?: string;
}
