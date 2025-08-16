import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ClientCoachStatus, ClientCoachRole } from '@prisma/client';

export class RelationshipQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: ClientCoachStatus })
  @IsOptional()
  @IsEnum(ClientCoachStatus)
  status?: ClientCoachStatus;

  @ApiPropertyOptional({ enum: ClientCoachRole })
  @IsOptional()
  @IsEnum(ClientCoachRole)
  role?: ClientCoachRole;

  @ApiPropertyOptional({ description: 'Filter by client ID' })
  @IsOptional()
  @IsUUID()
  clientID?: string;

  @ApiPropertyOptional({ description: 'Filter by coach ID (admin use)' })
  @IsOptional()
  @IsUUID()
  coachID?: string;
}
