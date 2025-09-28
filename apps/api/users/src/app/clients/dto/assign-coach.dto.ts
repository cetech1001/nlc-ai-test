import {IsBoolean, IsOptional, IsString, IsUUID} from "class-validator";

export class AssignCoachDto {
  @IsUUID()
  coachID: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
