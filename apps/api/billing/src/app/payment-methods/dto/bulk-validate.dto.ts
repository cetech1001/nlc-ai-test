import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class BulkValidateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  coachID?: string;
}
