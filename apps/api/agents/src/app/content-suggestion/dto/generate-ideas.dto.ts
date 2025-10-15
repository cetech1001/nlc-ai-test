import { IsArray, IsOptional, IsString } from 'class-validator';

export class GenerateIdeasDto {
  @IsString() threadID!: string;
  @IsString() transcriptText!: string;

  @IsOptional() @IsArray() desiredVibes?: string[];
  @IsOptional() @IsString() extraContext?: string;
}
