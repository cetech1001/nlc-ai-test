import { IsArray, IsOptional, IsString } from 'class-validator';

export class FromMediaDto {
  @IsString() coachID!: string;
  @IsString() threadID!: string;
  @IsOptional() @IsArray() desiredVibes?: string[];
  @IsOptional() @IsString() extraContext?: string;
}
