import { Body, Controller, HttpCode, HttpStatus, Post, Get, Patch, UseGuards, Query, Res, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './services/google-auth.service';
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyCodeDto,
  UpdateProfileDto,
  UpdatePasswordDto,
  GoogleAuthDto
} from './dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import {type AUTH_ROLES, UserType} from "@nlc-ai/types";
import type {Response, Request} from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login (supports both coach and admin)' })
  @ApiQuery({ name: 'type', enum: ['coach', 'admin'], required: false, description: 'User type - defaults to coach' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Query('type') type: AUTH_ROLES = UserType.coach
  ) {
    if (type === 'admin') {
      return this.authService.loginAdmin(loginDto);
    }
    return this.authService.loginCoach(loginDto);
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register new coach' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid input or email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.registerCoach(registerDto);
  }

  @Post('google/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Google ID token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid Google token' })
  async googleLogin(@Body() googleAuthDto: GoogleAuthDto) {
    return this.googleAuthService.loginWithGoogleToken(googleAuthDto.idToken);
  }

  @Post('google/register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register with Google ID token' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid Google token or user exists' })
  async googleRegister(@Body() googleAuthDto: GoogleAuthDto) {
    return this.googleAuthService.registerWithGoogle(googleAuthDto.idToken);
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const result = await this.googleAuthService.googleAuth(req.user);

    const frontendUrl = this.configService.get<string>('COACH_PLATFORM_URL');
    const redirectUrl = `${frontendUrl}/auth/callback?token=${result.access_token}`;

    res.redirect(redirectUrl);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiQuery({ name: 'type', enum: ['coach', 'admin'], required: false, description: 'User type - defaults to coach' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Query('type') type: AUTH_ROLES = UserType.coach
  ) {
    return this.authService.forgotPassword(forgotPasswordDto, type);
  }

  @Post('verify-code')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify reset code or email verification code' })
  @ApiResponse({ status: 200, description: 'Code verified, reset token or login provided' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCode(verifyCodeDto);
  }

  @Post('resend-code')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification code' })
  async resendCode(
    @Body() body: { email: string; type?: 'verification' | 'reset' }
  ) {
    return this.authService.resendCode(body.email, body.type);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiQuery({ name: 'type', enum: ['coach', 'admin'], required: false, description: 'User type - defaults to coach' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Query('type') type: AUTH_ROLES = UserType.coach
  ) {
    return this.authService.resetPassword(resetPasswordDto, type);
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req: { user: { id: string; type: AUTH_ROLES } }) {
    const { id, type } = req.user;
    return this.authService.findUserById(id, type);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateProfile(
    @Req() req: { user: { id: string; type: AUTH_ROLES } },
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    const { id, type } = req.user;
    return this.authService.updateProfile(id, type, updateProfileDto);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid password format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePassword(
    @Req() req: { user: { id: string; type: AUTH_ROLES } },
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    const { id, type } = req.user;
    return this.authService.updatePassword(id, type, updatePasswordDto);
  }
}
