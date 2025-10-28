import {RegistrationRequest} from "@nlc-ai/types";
import {ApiProperty} from "@nestjs/swagger";
import {IsBoolean, IsEmail, IsOptional, IsString, Matches, MinLength} from "class-validator";

export class CoachRegisterDto implements RegistrationRequest {
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

  @ApiProperty({ example: 'coach@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({ required: true })
  @IsBoolean()
  marketingOptIn: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  triggerPasswordReset = false;
}
