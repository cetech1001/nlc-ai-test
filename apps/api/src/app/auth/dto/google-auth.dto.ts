import {ApiProperty} from "@nestjs/swagger";
import {IsString, MinLength} from "class-validator";
import {GoogleAuthRequest} from "@nlc-ai/types";

export class GoogleAuthDto implements GoogleAuthRequest{
  @ApiProperty({ example: 'google_id_token_here' })
  @IsString()
  @MinLength(1)
  idToken: string;
}
