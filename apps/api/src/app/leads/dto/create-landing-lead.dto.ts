import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEmail, IsObject, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LandingLeadInfoDto {
  @ApiProperty({ example: 'Okwudili Ezeoke' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'alexemerie7@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+447535887415' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateLandingLeadDto {
  @ApiProperty({ type: LandingLeadInfoDto })
  @ValidateNested()
  @Type(() => LandingLeadInfoDto)
  lead!: LandingLeadInfoDto;

  @ApiProperty({ description: 'Answers keyed by question number', example: {
    '1': 'under10',
    '2': 'teachable',
    '3': '50k-100k',
    '4': 'sole_decision',
    '5': ['email_behind','lose_track','no_followup'],
    '6': 'scale_revenue',
    '7': ['client_email','lead_followup'],
    '8': 'very'
  } })
  @IsObject()
  answers!: Record<string, unknown>;

  @ApiProperty({ example: true })
  @IsBoolean()
  qualified!: boolean;

  @ApiProperty({ example: '2025-08-11T13:50:04.994Z' })
  @IsDateString()
  submittedAt!: string;
}
