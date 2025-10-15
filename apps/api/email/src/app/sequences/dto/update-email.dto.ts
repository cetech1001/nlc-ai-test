import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsDateString, MaxLength } from "class-validator";

export class UpdateEmailDto {
  @ApiProperty({ required: false, description: 'Email subject line' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiProperty({ required: false, description: 'Email body content (HTML)' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ required: false, description: 'Scheduled send date (ISO format)' })
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @ApiProperty({ required: false, description: 'Timing description (e.g., "1-day", "1-week")' })
  @IsOptional()
  @IsString()
  timing?: string;
}
