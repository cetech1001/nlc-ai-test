import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import {Type, Transform} from "class-transformer";
import { InvoiceStatus } from '@prisma/client';
import { InvoiceFilters } from '@nlc-ai/api-types';

export class InvoiceFiltersDto implements InvoiceFilters {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  coachID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  subscriptionID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  transactionID?: string;

  @ApiProperty({ enum: InvoiceStatus, required: false })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minAmount?: number;

  @ApiProperty({ example: 10000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxAmount?: number;

  @ApiProperty({ example: '2025-08-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  startDate?: Date;

  @ApiProperty({ example: '2025-08-31T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  endDate?: Date;

  @ApiProperty({ example: '2025-09-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  dueDateStart?: Date;

  @ApiProperty({ example: '2025-09-30T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  dueDateEnd?: Date;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  overdue?: boolean;
}
