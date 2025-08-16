import { IsEmail, IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClientCoachRole } from '@prisma/client';

export class CreateInviteDto {
  @ApiProperty({ example: 'client@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'coach-uuid' })
  @IsOptional()
  @IsUUID()
  coachID?: string;

  @ApiPropertyOptional({ enum: ClientCoachRole, default: 'client' })
  @IsOptional()
  @IsEnum(ClientCoachRole)
  role?: ClientCoachRole;

  @ApiPropertyOptional({ example: 'Welcome to our coaching program! Looking forward to working with you.' })
  @IsOptional()
  @IsString()
  message?: string;
}
