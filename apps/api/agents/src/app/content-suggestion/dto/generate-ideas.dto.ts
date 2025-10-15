import { IsArray, IsOptional, IsString } from 'class-validator';

export class GenerateIdeasDto {
  @IsString() coachID!: string;
  @IsString() threadID!: string;
  @IsString() transcriptText!: string;

  @IsOptional() @IsArray() desiredVibes?: string[];
  @IsOptional() @IsString() extraContext?: string;
}
