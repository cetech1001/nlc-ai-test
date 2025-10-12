import { IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { SendEmailDto } from './send-email.dto';

export class BulkEmailItemDto extends SendEmailDto {
  @IsString()
  override to: string;
}

export class SendBulkEmailsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkEmailItemDto)
  emails: BulkEmailItemDto[];

  @IsOptional()
  @IsString()
  batchName?: string;

  @IsOptional()
  @IsString()
  batchDescription?: string;
}
