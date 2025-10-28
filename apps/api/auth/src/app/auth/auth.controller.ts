import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import {AuthResponse, type AuthUser, UserType} from '@nlc-ai/types';
import {CurrentUser, Public, UserTypes, UserTypesGuard} from "@nlc-ai/api-auth";
import { AuthService } from './auth.service';
import { GoogleAuthService } from './services/google-auth.service';
import {
  LoginDto,
  CoachRegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyCodeDto,
  ClientRegisterDto,
  ClientGoogleAuthDto,
  SwitchCoachContextDto,
  GoogleAuthDto,
} from './dto';
import {ConfigService} from "@nestjs/config";

@UseGuards(UserTypesGuard)
@ApiTags('Authentication')
@Controller('')
export class AuthController {
  private readonly publicTokenName: string;

  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {
    this.publicTokenName = this.config.get('auth.tokens.public')!;
  }

  private setAuthCookie(res: Response, req: Request, token: string, userType: UserType, rememberMe = false) {
    const isProduction = this.config.get('auth.service.env') === 'production';
    const domain = this.getBaseDomain(req);

    // Use different cookie names based on user type
    const cookieName = `${this.publicTokenName}_${userType}`;

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      ...(domain && { domain }),
    };

    res.cookie(cookieName, token, cookieOptions);
  }

  private clearAuthCookie(res: Response, req: Request, userType: UserType) {
    const domain = this.getBaseDomain(req);
    const isProduction = this.config.get('auth.service.env') === 'production';

    const cookieName = `${this.publicTokenName}_${userType}`;

    const clearOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      ...(domain && { domain }),
    };

    res.clearCookie(cookieName, clearOptions);
  }

  private getBaseDomain(req: Request): string | undefined {
    const host = req.get('host');
    if (!host) return undefined;

    if (host.includes('localhost') || /^\d+\.\d+\.\d+\.\d+/.test(host)) {
      return undefined;
    }

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
    this.setAuthCookie(res, req, result.access_token, UserType.ADMIN, loginDto.rememberMe);
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
    const result = await this.authService.loginCoach(loginDto, req);
    this.setAuthCookie(res, req, result.access_token, UserType.COACH, loginDto.rememberMe);
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
    const result = await this.googleAuthService.coachGoogleAuth(googleAuthDto.idToken, req);
    this.setAuthCookie(res, req, result.access_token, UserType.COACH);
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
    this.setAuthCookie(res, req, result.access_token, UserType.CLIENT, loginDto.rememberMe);
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
    this.setAuthCookie(res, req, (result as any).access_token, UserType.CLIENT);
    return result;
  }

  @Post('client/switch-coach')
  @UserTypes(UserType.CLIENT)
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
    const result = await this.authService.switchCoachContext(user.id, switchCoachDto.coachID);
    this.setAuthCookie(res, req, result.access_token, UserType.CLIENT);
    return result;
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiQuery({ name: 'type', enum: ['coach', 'admin', 'client'], required: false, description: 'User type - defaults to coach' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Query('type') type: UserType = UserType.COACH
  ) {
    console.log("Body: ", forgotPasswordDto);
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
    const result = await this.authService.verifyCode(verifyCodeDto, req);

    if ((result as AuthResponse).access_token) {
      this.setAuthCookie(res, req, (result as AuthResponse).access_token, (result as AuthResponse).user.type);
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
  @ApiQuery({ name: 'type', enum: UserType, required: false, description: 'User type - defaults to coach' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Query('type') type: UserType = UserType.COACH
  ) {
    return this.authService.resetPassword(resetPasswordDto, type);
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    [UserType.ADMIN, UserType.COACH, UserType.CLIENT].forEach(type => {
      this.clearAuthCookie(res, req, type);
    });
    return { message: 'Logged out successfully' };
  }
}
