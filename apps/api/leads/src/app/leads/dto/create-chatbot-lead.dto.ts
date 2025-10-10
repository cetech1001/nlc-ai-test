import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateChatbotLeadDto {
  @ApiProperty({ example: 'c4f7b8a0-1234-5678-90ab-cdef12345678' })
  @IsUUID()
  coachID: string;

  @ApiProperty({ example: 'c4f7b8a0-1234-5678-90ab-cdef12345678' })
  @IsUUID()
  threadID: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1-555-0123' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  marketingOptIn?: boolean;
}
