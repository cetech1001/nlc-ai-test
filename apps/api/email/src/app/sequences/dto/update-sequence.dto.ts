import { IsString, IsOptional, IsArray, IsBoolean, IsEnum, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TriggerType, SequenceEmailDto } from './create-sequence.dto';

export class UpdateSequenceDto {
  @ApiProperty({ required: false, description: 'Sequence name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false, description: 'Sequence description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false, description: 'Sequence category' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category?: string;

  @ApiProperty({ enum: TriggerType, required: false, description: 'How this sequence is triggered' })
  @IsOptional()
  @IsEnum(TriggerType)
  triggerType?: TriggerType;

  @ApiProperty({ required: false, description: 'Whether sequence is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: [SequenceEmailDto], required: false, description: 'Updated emails in sequence' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SequenceEmailDto)
  emails?: SequenceEmailDto[];
}
