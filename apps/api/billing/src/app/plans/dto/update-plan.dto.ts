import { ApiProperty } from '@nestjs/swagger';
import {IsString, IsNumber, IsOptional, IsBoolean, Min, MaxLength, IsArray} from 'class-validator';
import { UpdatePlanRequest } from '@nlc-ai/api-types';

export class UpdatePlanDto implements UpdatePlanRequest {
  @ApiProperty({ example: 'Premium Plan', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ example: 'Advanced coaching features with unlimited clients', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 9900, description: 'Monthly price in cents', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyPrice?: number;

  @ApiProperty({ example: 99000, description: 'Annual price in cents', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualPrice?: number;

  @ApiProperty({ example: '#7B21BA', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxClients?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAiAgents?: number;

  @ApiProperty({
    example: [
      'AI Email Management',
      'Client Retention Tools',
      'Advanced Analytics'
    ],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiProperty({
    example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
    required: false,
    description: 'Array of AI agent IDs accessible with this plan'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessibleAiAgents?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
