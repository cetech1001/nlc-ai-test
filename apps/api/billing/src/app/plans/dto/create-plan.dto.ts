import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsObject, Min, MaxLength } from 'class-validator';
import { CreatePlanRequest } from '../types/plan.interfaces';

export class CreatePlanDto implements CreatePlanRequest {
  @ApiProperty({ example: 'Premium Plan' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Advanced coaching features with unlimited clients', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 9900, description: 'Monthly price in cents' })
  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @ApiProperty({ example: 99000, description: 'Annual price in cents' })
  @IsNumber()
  @Min(0)
  annualPrice: number;

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

  @ApiProperty({ example: { emailSupport: true, analytics: true }, required: false })
  @IsOptional()
  @IsObject()
  features?: Record<string, any>;
}
