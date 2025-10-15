import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RegenDto {
  @IsString() coachID!: string;
  @IsString() threadID!: string;

  @IsInt() @Min(0) variantIndex!: number;
  @IsIn(['hook','main','cta']) section!: 'hook'|'main'|'cta';

  @IsOptional() @IsString() constraints?: string;
}
