import { Body, Controller, HttpCode, HttpStatus, Post, Get, Patch, UseGuards, Request, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  AdminLoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyCodeDto,
  UpdateProfileDto,
  UpdatePasswordDto
} from './dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {type AUTH_USER_TYPE, USER_TYPE} from "@nlc-ai/types";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login (supports both coach and admin)' })
  @ApiQuery({ name: 'type', enum: ['coach', 'admin'], required: false, description: 'User type - defaults to coach' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto | AdminLoginDto,
    @Query('type') type: AUTH_USER_TYPE = USER_TYPE.coach
  ) {
    if (type === 'admin') {
      return this.authService.loginAdmin(loginDto as AdminLoginDto);
    }
    return this.authService.loginCoach(loginDto as LoginDto);
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register new coach (admin registration not supported)' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid input or email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.registerCoach(registerDto);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiQuery({ name: 'type', enum: ['coach', 'admin'], required: false, description: 'User type - defaults to coach' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Query('type') type: AUTH_USER_TYPE = USER_TYPE.coach
  ) {
    return this.authService.forgotPassword(forgotPasswordDto, type);
  }

  @Post('verify-code')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify reset code' })
  @ApiResponse({ status: 200, description: 'Code verified, reset token provided' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCode(verifyCodeDto);
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
    @Query('type') type: AUTH_USER_TYPE = USER_TYPE.coach
  ) {
    return this.authService.resetPassword(resetPasswordDto, type);
  }

  @Post('resend-code')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification code' })
  async resendCode(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.resendCode(forgotPasswordDto.email);
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
  async getProfile(@Request() req: { user: { id: string; type: AUTH_USER_TYPE } }) {
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
    @Request() req: { user: { id: string; type: AUTH_USER_TYPE } },
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
    @Request() req: { user: { id: string; type: AUTH_USER_TYPE } },
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    const { id, type } = req.user;
    return this.authService.updatePassword(id, type, updatePasswordDto);
  }
}
