import { IsOptional, IsString } from 'class-validator';

export class ReplyToThreadDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  subject?: string;
}
