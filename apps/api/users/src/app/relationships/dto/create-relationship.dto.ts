import { IsUUID, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClientCoachRole } from '@prisma/client';

export class CreateRelationshipDto {
  @ApiProperty({ example: 'client-uuid' })
  @IsUUID()
  clientID: string;

  @ApiPropertyOptional({ example: 'coach-uuid' })
  @IsOptional()
  @IsUUID()
  coachID?: string;

  @ApiPropertyOptional({ enum: ClientCoachRole, default: 'client' })
  @IsOptional()
  @IsEnum(ClientCoachRole)
  role?: ClientCoachRole;

  @ApiPropertyOptional({ example: 'Special attention needed for nutrition goals' })
  @IsOptional()
  @IsString()
  notes?: string;
}
