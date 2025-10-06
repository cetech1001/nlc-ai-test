import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEmail, IsObject, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LandingLeadInfoDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'johndoe@mail.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+15558938234' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: true })
  @IsBoolean()
  marketingOptIn: boolean;
}

export class CreateLandingLeadDto {
  @ApiProperty({ type: LandingLeadInfoDto })
  @ValidateNested()
  @Type(() => LandingLeadInfoDto)
  lead: LandingLeadInfoDto;

  @ApiProperty({
    description: 'Answers keyed by question number',
    example: {
      '1': 'under10',
      '2': 'teachable',
      '3': '50k-100k'
    }
  })
  @IsObject()
  answers: Record<string, unknown>;

  @ApiProperty({ example: true })
  @IsBoolean()
  qualified: boolean;

  @ApiProperty({ example: '2025-08-11T13:50:04.994Z' })
  @IsDateString()
  submittedAt: string;
}
