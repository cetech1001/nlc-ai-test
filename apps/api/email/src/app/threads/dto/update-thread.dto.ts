import { IsOptional, IsBoolean, IsString } from 'class-validator';
import {EmailThreadPriority, EmailThreadStatus, UpdateEmailThreadRequest} from "@nlc-ai/types";

export class UpdateThreadDto implements UpdateEmailThreadRequest{
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsString()
  status?: EmailThreadStatus;

  @IsOptional()
  @IsString()
  priority?: EmailThreadPriority;
}
