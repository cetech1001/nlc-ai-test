import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {ForgotPasswordRequest} from "@nlc-ai/types";

export class ForgotPasswordDto implements ForgotPasswordRequest{
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}
