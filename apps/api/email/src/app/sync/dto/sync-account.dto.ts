import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { SyncEmailAccountRequest } from '@nlc-ai/types';

export class SyncAccountDto implements SyncEmailAccountRequest {
  @IsString()
  accountID: string;

  @IsOptional()
  @IsBoolean()
  forceFull?: boolean;

  @IsOptional()
  @IsNumber()
  maxEmails?: number;
}
