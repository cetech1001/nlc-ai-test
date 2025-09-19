import { IsBoolean, IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {DripInterval, UpdateDripSchedule} from "@nlc-ai/types";



export class UpdateDripScheduleDto implements UpdateDripSchedule{
  @ApiProperty({ description: 'Enable drip content' })
  @IsBoolean()
  isDripEnabled: boolean;

  @ApiPropertyOptional({ description: 'Drip interval', enum: DripInterval })
  @IsOptional()
  @IsEnum(DripInterval)
  dripInterval?: DripInterval;

  @ApiPropertyOptional({ description: 'Number of lessons to release per interval' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  dripCount?: number;

  @ApiPropertyOptional({ description: 'Initial delay before first drip (days)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialDelay?: number;

  @ApiPropertyOptional({ description: 'Release all content at once on specific date' })
  @IsOptional()
  @IsString()
  releaseDate?: string;

  @ApiPropertyOptional({ description: 'Automatically unlock next chapter when previous is completed' })
  @IsOptional()
  @IsBoolean()
  autoUnlockChapters?: boolean;

  @ApiPropertyOptional({ description: 'Require completion percentage before unlocking next content' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  completionThreshold?: number;
}
