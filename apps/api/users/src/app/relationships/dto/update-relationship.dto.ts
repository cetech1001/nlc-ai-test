import { PartialType } from '@nestjs/swagger';
import { CreateRelationshipDto } from './create-relationship.dto';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClientCoachStatus } from '@prisma/client';

export class UpdateRelationshipDto extends PartialType(CreateRelationshipDto) {
  @ApiPropertyOptional({ enum: ClientCoachStatus })
  @IsOptional()
  @IsEnum(ClientCoachStatus)
  status?: ClientCoachStatus;

  @ApiPropertyOptional({ description: 'Set as primary coach for this client' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
