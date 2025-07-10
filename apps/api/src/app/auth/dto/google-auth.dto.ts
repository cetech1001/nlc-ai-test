import {ApiProperty} from "@nestjs/swagger";
import {IsString, MinLength} from "class-validator";

export class GoogleAuthDto {
  @ApiProperty({ example: 'google_id_token_here' })
  @IsString()
  @MinLength(1)
  idToken: string;
}
