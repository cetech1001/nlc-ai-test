import { IsString, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MetricDataDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  previousValue?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  changePercentage?: number;
}

export class TemplatePerformanceDto {
  @ApiProperty()
  @IsString()
  templateID: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsNumber()
  usageCount: number;

  @ApiProperty()
  @IsNumber()
  openRate: number;

  @ApiProperty()
  @IsNumber()
  clickRate: number;

  @ApiProperty()
  @IsNumber()
  bounceRate: number;
}

export class SequencePerformanceDto {
  @ApiProperty()
  @IsString()
  sequenceID: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsNumber()
  totalEmails: number;

  @ApiProperty()
  @IsNumber()
  emailsSent: number;

  @ApiProperty()
  @IsNumber()
  completionRate: number;

  @ApiProperty()
  @IsNumber()
  averageEngagement: number;
}

export class PerformanceReportDto {
  @ApiProperty({ type: [MetricDataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetricDataDto)
  overallMetrics: MetricDataDto[];

  @ApiProperty({ type: [TemplatePerformanceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplatePerformanceDto)
  topTemplates: TemplatePerformanceDto[];

  @ApiProperty({ type: [SequencePerformanceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SequencePerformanceDto)
  topSequences: SequencePerformanceDto[];

  @ApiProperty()
  @IsString()
  periodStart: string;

  @ApiProperty()
  @IsString()
  periodEnd: string;

  @ApiProperty()
  @IsString()
  generatedAt: string;
}
