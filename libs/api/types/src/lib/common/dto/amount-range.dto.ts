import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsOptional} from "class-validator";
import {Type} from "class-transformer";

export class AmountRangeDto {
  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  min?: number;

  @ApiProperty({ example: 10000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  max?: number;
}
