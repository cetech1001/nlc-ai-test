import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type, Transform } from "class-transformer";
import { InvoiceStatus } from '@prisma/client';
import {InvoiceFilters, UserType} from '@nlc-ai/api-types';
import { AmountRangeDto, DateRangeDto } from "@nlc-ai/api-dto";

export class InvoiceFiltersDto implements InvoiceFilters {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  customerID?: string;

  @ApiProperty({ enum: [UserType.coach, UserType.client], required: false })
  @IsOptional()
  @IsString()
  @IsIn([UserType.coach, UserType.client])
  customerType?: UserType;

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

  @ApiProperty({ type: AmountRangeDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AmountRangeDto)
  amountRange?: {
    min?: number;
    max?: number;
  };

  @ApiProperty({ type: DateRangeDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: {
    start?: Date;
    end?: Date;
  };

  @ApiProperty({ type: DateRangeDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dueDateRange?: {
    start?: Date;
    end?: Date;
  };

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
