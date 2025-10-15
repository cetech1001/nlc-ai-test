import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsIn,
  ValidateNested,
  ArrayNotEmpty,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class SequenceConfigDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  emailCount?: number;

  @IsOptional()
  @IsIn(['aggressive', 'standard', 'nurturing', 'minimal'])
  sequenceType?: 'aggressive' | 'standard' | 'nurturing' | 'minimal';

  @IsOptional()
  @IsString()
  customInstructions?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  timings?: string[];
}

export class GenerateSequenceDto {
  @IsUUID()
  leadID!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SequenceConfigDto)
  sequenceConfig?: SequenceConfigDto;
}

export class RegenerateEmailsDto {
  @IsUUID()
  sequenceID!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  emailOrders!: number[];

  @IsOptional()
  @IsString()
  customInstructions?: string;
}
