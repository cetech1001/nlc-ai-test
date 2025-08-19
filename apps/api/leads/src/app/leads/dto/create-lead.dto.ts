import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus } from '@nlc-ai/api-types';

export class CreateLeadDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1-555-0123' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'website' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ enum: LeadStatus, example: LeadStatus.CONTACTED })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  meetingDate?: string;

  @ApiPropertyOptional({ example: '10:00' })
  @IsOptional()
  @IsString()
  meetingTime?: string;

  @ApiPropertyOptional({ example: 'Interested in Growth Pro plan' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// apps/api/leads/src/app/leads/dto/create-landing-lead.dto.ts


// apps/api/leads/src/app/leads/dto/update-lead.dto.ts


// apps/api/leads/src/app/leads/dto/lead-query.dto.ts

