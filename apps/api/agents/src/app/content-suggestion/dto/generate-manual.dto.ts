import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateManualDto {
  @IsString() threadID!: string;

  @IsString() @MaxLength(500) idea!: string;

  @IsOptional() @IsString() contentType?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) targetPlatforms?: string[];
  @IsOptional() @IsString() @MaxLength(300) customInstructions?: string;

  // Video options
  @IsOptional() @IsString() videoDuration?: string;
  @IsOptional() @IsString() videoStyle?: string;
  @IsOptional() @IsBoolean() includeMusic?: boolean;
  @IsOptional() @IsBoolean() includeCaptions?: boolean;
  @IsOptional() @IsEnum(['vertical', 'horizontal', 'square']) videoOrientation?: 'vertical' | 'horizontal' | 'square';

  @IsOptional() @IsArray() desiredVibes?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) referenceVideoURLs?: string[];
}
