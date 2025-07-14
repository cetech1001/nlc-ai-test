import { IsString, IsInt, IsOptional, IsBoolean, IsArray, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {CreatePlanRequest} from "@nlc-ai/types";

export class CreatePlanDto implements CreatePlanRequest{
  @ApiProperty({ example: 'Growth Pro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Perfect for growing coaching businesses', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '#7B21BA', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 1099 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  monthlyPrice: number;

  @ApiProperty({ example: 10990 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  annualPrice: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxClients?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
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

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
