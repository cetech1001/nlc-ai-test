import { IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleEmailDto } from './schedule-email.dto';

export class BulkScheduleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleEmailDto)
  emails: ScheduleEmailDto[];

  @IsOptional()
  @IsString()
  batchName?: string;
}
