import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeEmailDto {
  @ApiProperty({ example: 'Follow-up: Your coaching transformation awaits' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'Hi John,\n\nI hope this message finds you well...' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ example: 'coach-uuid-here' })
  @IsOptional()
  @IsString()
  coachID?: string;

  @ApiPropertyOptional({ enum: ['lead', 'client', 'general'], example: 'lead' })
  @IsOptional()
  @IsEnum(['lead', 'client', 'general'])
  recipientType?: 'lead' | 'client' | 'general';
}

export class QuickCheckDto {
  @ApiProperty({ example: 'Follow-up on our conversation' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'Hi there, I wanted to follow up...' })
  @IsString()
  body: string;
}
