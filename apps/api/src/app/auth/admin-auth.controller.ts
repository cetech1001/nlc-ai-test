import {Controller, Post, Body, HttpCode, HttpStatus, Res} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AdminLoginDto, ForgotPasswordDto, VerifyCodeDto, ResetPasswordDto } from './dto';
import {Public} from "./decorators/public.decorator";
import {type Response} from "express";
import {ConfigService} from "@nestjs/config";

@ApiTags('Admin Authentication')
@Controller('auth/admin')
@Public()
export class AdminAuthController {
  private readonly isProduction: boolean = false;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService) {
    this.isProduction = configService.get('NODE_ENV') === 'production';
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() adminLoginDto: AdminLoginDto,
    @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.loginAdmin(adminLoginDto);

    response.cookie('adminToken', result.access_token, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'none' : 'lax',
      maxAge: adminLoginDto.rememberMe
        ? 30 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000,
      path: '/',
    });

    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin logout' })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('adminToken', {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'none' : 'lax',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset for admin' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto, 'admin');
  }

  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify reset code for admin' })
  @ApiResponse({ status: 200, description: 'Code verified, reset token provided' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCode(verifyCodeDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password for admin' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto, 'admin');
  }

  @Post('resend-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification code for admin' })
  async resendCode(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.resendCode(forgotPasswordDto.email);
  }
}
