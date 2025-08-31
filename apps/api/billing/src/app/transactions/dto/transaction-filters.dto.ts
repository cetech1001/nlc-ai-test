import { ApiProperty } from '@nestjs/swagger';
import {IsOptional, IsString, IsUUID, IsEnum, ValidateNested} from 'class-validator';
import {Type} from "class-transformer";
import {TransactionFilters} from '@nlc-ai/api-types';
import {AmountRangeDto, DateRangeDto, PaginationDto} from "@nlc-ai/api-dto";
import {PaymentMethodType, TransactionStatus} from "@nlc-ai/types";

export class TransactionFiltersDto extends PaginationDto implements TransactionFilters {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  coachID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  planID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  subscriptionID?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  paymentMethodID?: string;

  @ApiProperty({ enum: TransactionStatus, required: false })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({ enum: PaymentMethodType, required: false })
  @IsOptional()
  @IsEnum(PaymentMethodType)
  paymentMethodType?: PaymentMethodType;

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

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;
}
