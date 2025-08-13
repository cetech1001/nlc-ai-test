import { IsEmail, IsString, MinLength, Matches, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {UpdateProfileRequest} from "@nlc-ai/types";

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

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  desktopNotifications?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;
}
