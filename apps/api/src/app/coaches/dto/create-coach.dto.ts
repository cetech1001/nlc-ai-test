import {IsEmail, IsOptional, IsString, IsUrl} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCoach } from "@nlc-ai/types";
import {Transform} from "class-transformer";

export class CreateCoachDto implements CreateCoach {
  @ApiProperty({ example: 'coach@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'Success Coaching LLC', required: false })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiProperty({ example: '+1-555-0123', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({ example: 'Experienced life coach specializing in career transitions', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 'https://mycoaching.com', required: false })
  @IsOptional()
  @Transform(v => v.value || undefined)
  @IsUrl()
  websiteUrl?: string;

  @ApiProperty({ example: 'America/New_York', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;
}
