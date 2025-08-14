import {IsEmail, IsString, MinLength, IsOptional, IsBoolean, Matches, Length} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ForgotPasswordRequest,
  GoogleAuthRequest,
  ResetPasswordRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
  VerifyCodeRequest
} from "@nlc-ai/api-types";

export class LoginDto {
  @ApiProperty({ example: 'coach@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(1)
  password: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class GoogleAuthDto implements GoogleAuthRequest{
  @ApiProperty({ example: 'google_id_token_here' })
  @IsString()
  @MinLength(1)
  idToken: string;
}

export class ForgotPasswordDto implements ForgotPasswordRequest{
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto implements ResetPasswordRequest{
  @ApiProperty({ example: 'reset-token-here' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}

export class UpdatePasswordDto implements UpdatePasswordRequest{
  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;
}

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

export class UpdateProfileDto implements UpdateProfileRequest{
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  @Matches(/^[a-zA-Z\s]+$/, { message: 'First name can only contain letters and spaces' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Last name can only contain letters and spaces' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'America/New_York' })
  @IsEmail()
  timezone: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  desktopNotifications?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;
}
