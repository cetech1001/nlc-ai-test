import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Patch,
  UseGuards,
  Query,
  BadRequestException,
  Res,
  Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { type AuthUser, UserType } from '@nlc-ai/api-types';
import {CurrentUser, JwtAuthGuard, Public, UserTypes, UserTypesGuard} from "@nlc-ai/api-auth";
import { AuthService } from './auth.service';
import { GoogleAuthService } from './services/google-auth.service';
import {
  LoginDto,
  CoachRegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyCodeDto,
  UpdateProfileDto,
  UpdatePasswordDto,
  ClientRegisterDto,
  ClientGoogleAuthDto,
  SwitchCoachContextDto,
  GoogleAuthDto,
} from './dto';

@ApiTags('Authentication')
@Controller('')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  private setAuthCookie(res: Response, req: Request, token: string, rememberMe = false) {
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = this.getBaseDomain(req);

    const cookieOptions = {
      httpOnly: true, // Important: prevents XSS attacks
      secure: isProduction, // Only HTTPS in production
      sameSite: 'lax' as const,
      path: '/',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 days or 1 day
      ...(domain && { domain }), // Only set domain if we have one
    };

    res.cookie('nlc_auth_token', token, cookieOptions);
  }

  private clearAuthCookie(res: Response, req: Request) {
    const domain = this.getBaseDomain(req);

    const clearOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      ...(domain && { domain }),
    };

    res.clearCookie('nlc_auth_token', clearOptions);
  }

  private getBaseDomain(req: Request): string | undefined {
    const host = req.get('host');
    if (!host) return undefined;

    // Don't set domain for localhost/development
    if (host.includes('localhost') || /^\d+\.\d+\.\d+\.\d+/.test(host)) {
      return undefined;
    }

    // Extract base domain (e.g., yourdomain.com from api.yourdomain.com)
    const parts = host.split('.');
    if (parts.length >= 2) {
      return `.${parts.slice(-2).join('.')}`;
    }

    return undefined;
  }

  @Post('admin/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginAdmin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    const result = await this.authService.loginAdmin(loginDto);
    this.setAuthCookie(res, req, result.access_token, loginDto.rememberMe);
    return result;
  }

  @Post('coach/register')
  @Public()
  @ApiOperation({ summary: 'Register new coach' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid input or email already exists' })
  async registerCoach(@Body() registerDto: CoachRegisterDto) {
    return this.authService.registerCoach(registerDto);
  }

  @Post('coach/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Coach login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or email not verified' })
  async loginCoach(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    const result = await this.authService.loginCoach(loginDto);
    this.setAuthCookie(res, req, result.access_token, loginDto.rememberMe);
    return result;
  }

  @Post('coach/google/auth')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Coach Google OAuth (login or register)' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 400, description: 'Invalid Google token' })
  async coachGoogleAuth(
    @Body() googleAuthDto: GoogleAuthDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    const result = await this.googleAuthService.coachGoogleAuth(googleAuthDto.idToken);
    this.setAuthCookie(res, req, (result as any).access_token);
    return result;
  }

  @Post('client/register')
  @Public()
  @ApiOperation({ summary: 'Client registration (coach-invited)' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid invite token or input' })
  async registerClient(@Body() registerDto: ClientRegisterDto) {
    return this.authService.registerClient(registerDto);
  }

  @Post('client/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Client login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginClient(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    const result = await this.authService.loginClient(loginDto);
    this.setAuthCookie(res, req, result.access_token, loginDto.rememberMe);
    return result;
  }

  @Post('client/google/auth')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Client Google OAuth with invite token' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 400, description: 'Invalid Google token or invite token' })
  async clientGoogleAuth(
    @Body() clientGoogleAuthDto: ClientGoogleAuthDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    const result = await this.googleAuthService.clientGoogleAuth(
      clientGoogleAuthDto.idToken,
      clientGoogleAuthDto.inviteToken
    );
    this.setAuthCookie(res, req, (result as any).access_token);
    return result;
  }

  @Post('client/switch-coach')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @UserTypes(UserType.client)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Switch coach context for client' })
  @ApiResponse({ status: 200, description: 'Coach context switched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized or no access to coach' })
  async switchCoachContext(
    @CurrentUser() user: AuthUser,
    @Body() switchCoachDto: SwitchCoachContextDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    if (user.type !== UserType.client) {
      throw new BadRequestException('Only clients can switch coach context');
    }

    const result = await this.authService.switchCoachContext(user.id, switchCoachDto.coachID);
    this.setAuthCookie(res, req, result.access_token);
    return result;
  }

  // ========== COMMON AUTH ENDPOINTS ==========
  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiQuery({ name: 'type', enum: ['coach', 'admin', 'client'], required: false, description: 'User type - defaults to coach' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Query('type') type: UserType = UserType.coach
  ) {
    return this.authService.forgotPassword(forgotPasswordDto, type);
  }

  @Post('verify-code')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify reset code or email verification code' })
  @ApiResponse({ status: 200, description: 'Code verified, reset token or login provided' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifyCode(
    @Body() verifyCodeDto: VerifyCodeDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    const result = await this.authService.verifyCode(verifyCodeDto);

    if ((result as any).access_token) {
      this.setAuthCookie(res, req, (result as any).access_token);
    }

    return result;
  }

  @Post('resend-code')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification code' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  async resendCode(
    @Body() body: { email: string; type?: 'verification' | 'reset' }
  ) {
    return this.authService.resendCode(body.email, body.type);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiQuery({ name: 'type', enum: ['coach', 'admin', 'client'], required: false, description: 'User type - defaults to coach' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Query('type') type: UserType = UserType.coach
  ) {
    return this.authService.resetPassword(resetPasswordDto, type);
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    this.clearAuthCookie(res, req);
    return { message: 'Logged out successfully' };
  }

  // ========== PROTECTED ENDPOINTS ==========
  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No avatar URL found' })
  async uploadAvatar(@CurrentUser() user: AuthUser, @Body('avatarUrl') avatarUrl: string) {
    return this.authService.uploadAvatar(user.id, user.type, avatarUrl);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: AuthUser) {
    const { id, type } = user;
    return this.authService.findUserByID(id, type);
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
    @CurrentUser() user: AuthUser,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    const { id, type } = user;
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
    @CurrentUser() user: AuthUser,
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    const { id, type } = user;
    return this.authService.updatePassword(id, type, updatePasswordDto);
  }
}
