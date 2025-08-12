import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsBoolean, Min, Max, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SequenceConfigDto {
  @ApiProperty({
    example: 4,
    description: 'Number of emails in sequence (1-10)',
    minimum: 1,
    maximum: 10
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  emailCount: number;

  @ApiPropertyOptional({
    example: ['immediate', '3-days', '1-week', '2-weeks'],
    description: 'Custom timing for each email. If not provided, AI will decide based on sequence type'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  timings?: string[];

  @ApiPropertyOptional({
    example: 'Focus on providing value and building trust. Mention specific pain points around productivity.',
    description: 'Custom instructions for AI to follow when generating emails'
  })
  @IsOptional()
  @IsString()
  customInstructions?: string;

  @ApiPropertyOptional({
    enum: ['standard', 'aggressive', 'nurturing', 'minimal'],
    example: 'nurturing',
    description: 'Type of sequence that affects default timings and tone'
  })
  @IsOptional()
  @IsEnum(['standard', 'aggressive', 'nurturing', 'minimal'])
  sequenceType?: 'standard' | 'aggressive' | 'nurturing' | 'minimal';
}

export class CreateSequenceDto {
  @ApiProperty({ example: 'lead-uuid-here' })
  @IsString()
  leadID: string;

  @ApiPropertyOptional({ example: 'coach-uuid-here' })
  @IsOptional()
  @IsString()
  coachID?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => SequenceConfigDto)
  sequenceConfig: SequenceConfigDto;
}

export class UpdateSequenceDto {
  @ApiPropertyOptional({ example: 'Updated follow-up sequence with 5 emails' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 5,
    description: 'Change number of emails (will add/remove as needed)'
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  emailCount?: number;

  @ApiPropertyOptional({
    example: ['immediate', '2-days', '5-days', '1-week', '2-weeks'],
    description: 'Update timing for all emails'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  timings?: string[];
}

export class UpdateEmailDto {
  @ApiPropertyOptional({ example: 'Updated: Your coaching journey starts here' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 'Hi John,\n\nI hope this updated message finds you well...' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({
    example: '2025-01-20T10:00:00Z',
    description: 'Update when this email should be sent (ISO date string)'
  })
  @IsOptional()
  @IsString()
  scheduledFor?: string;

  @ApiPropertyOptional({
    example: '3-days',
    description: 'Update the timing description'
  })
  @IsOptional()
  @IsString()
  timing?: string;
}

export class RegenerateEmailsDto {
  @ApiProperty({
    example: [1, 3, 4],
    description: 'Which email positions to regenerate (1-based)'
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  emailOrders: number[];

  @ApiPropertyOptional({
    example: 'Make these emails more focused on productivity challenges',
    description: 'Custom instructions for regenerating these specific emails'
  })
  @IsOptional()
  @IsString()
  customInstructions?: string;
}

// Response DTOs for documentation
export class EmailInSequenceResponseDto {
  @ApiProperty({ example: 'email-uuid-here' })
  id: string;

  @ApiProperty({ example: 'sequence-uuid-here' })
  sequenceID: string;

  @ApiProperty({ example: 1 })
  sequenceOrder: number;

  @ApiProperty({ example: 'Your coaching journey starts here' })
  subject: string;

  @ApiProperty({ example: 'Hi John,\n\nI hope this message finds you well...' })
  body: string;

  @ApiProperty({ example: '3-days' })
  timing: string;

  @ApiProperty({ example: '2025-01-20T10:00:00Z' })
  scheduledFor: Date;

  @ApiProperty({ enum: ['scheduled', 'sent', 'failed', 'cancelled', 'paused'] })
  status: string;

  @ApiPropertyOptional({ example: '2025-01-20T10:15:00Z' })
  sentAt?: Date;

  @ApiPropertyOptional({ example: 85 })
  deliverabilityScore?: number;

  @ApiProperty({ example: false })
  isEdited: boolean;

  @ApiPropertyOptional({ example: 'Original AI generated content...' })
  originalAIVersion?: string;
}

export class EmailSequenceResponseDto {
  @ApiProperty({ example: 'sequence-uuid-here' })
  id: string;

  @ApiProperty({ example: 'lead-uuid-here' })
  leadID: string;

  @ApiProperty({ example: 'coach-uuid-here' })
  coachID: string;

  @ApiProperty({ example: 'contacted' })
  status: string;

  @ApiProperty({ example: '4-email nurturing follow-up sequence' })
  description: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 4 })
  totalEmails: number;

  @ApiProperty({ example: 1 })
  emailsSent: number;

  @ApiProperty({ example: 3 })
  emailsPending: number;

  @ApiProperty({ example: '2025-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T11:00:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional()
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  };

  @ApiProperty({ type: [EmailInSequenceResponseDto] })
  emails: EmailInSequenceResponseDto[];
}
