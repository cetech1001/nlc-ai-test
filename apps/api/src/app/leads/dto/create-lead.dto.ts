import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {CreateLead, LeadStatus} from "@nlc-ai/types";

export class CreateLeadDto implements CreateLead{
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  lastName: string;

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
