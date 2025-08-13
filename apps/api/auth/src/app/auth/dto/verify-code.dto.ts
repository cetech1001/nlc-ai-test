import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {VerifyCodeRequest} from "@nlc-ai/types";

export class VerifyCodeDto implements VerifyCodeRequest{
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'Verification code must be 6 digits' })
  code: string;
}
