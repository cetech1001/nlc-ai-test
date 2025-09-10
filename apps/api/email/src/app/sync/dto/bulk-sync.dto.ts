import { IsOptional, IsArray, IsString, IsBoolean } from 'class-validator';
import {BulkSyncRequest, UserType} from '@nlc-ai/types';

export class BulkSyncDto implements BulkSyncRequest {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accountIDs?: string[];

  @IsOptional()
  @IsString()
  userID?: string;

  @IsOptional()
  @IsString()
  userType?: UserType;

  @IsOptional()
  @IsBoolean()
  forceFull?: boolean;
}
