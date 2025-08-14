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
  UseInterceptors,
  BadRequestException,
  UploadedFile
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { type AuthUser, UserType } from '@nlc-ai/api-types';
import {CurrentUser, JwtAuthGuard, Public} from "@nlc-ai/api-auth";
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
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  // ========== ADMIN AUTHENTICATION ==========
  @Post('admin/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginAdmin(@Body() loginDto: LoginDto) {
    return this.authService.loginAdmin(loginDto);
  }

  // ========== COACH AUTHENTICATION ==========
  @Post('coaches/register')
  @Public()
  @ApiOperation({ summary: 'Register new coach' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid input or email already exists' })
  async registerCoach(@Body() registerDto: CoachRegisterDto) {
    return this.authService.registerCoach(registerDto);
  }

  @Post('coaches/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Coach login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or email not verified' })
  async loginCoach(@Body() loginDto: LoginDto) {
    return this.authService.loginCoach(loginDto);
  }

  @Post('coaches/google/auth')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Coach Google OAuth (login or register)' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 400, description: 'Invalid Google token' })
  async coachGoogleAuth(@Body() googleAuthDto: GoogleAuthDto) {
    return this.googleAuthService.coachGoogleAuth(googleAuthDto.idToken);
  }

  // ========== CLIENT AUTHENTICATION ==========
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
  async loginClient(@Body() loginDto: LoginDto) {
    return this.authService.loginClient(loginDto);
  }

  @Post('client/google/auth')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Client Google OAuth with invite token' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 400, description: 'Invalid Google token or invite token' })
  async clientGoogleAuth(@Body() clientGoogleAuthDto: ClientGoogleAuthDto) {
    return this.googleAuthService.clientGoogleAuth(
      clientGoogleAuthDto.idToken,
      clientGoogleAuthDto.inviteToken
    );
  }

  @Post('client/switch-coach')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Switch coach context for client' })
  @ApiResponse({ status: 200, description: 'Coach context switched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized or no access to coach' })
  async switchCoachContext(
    @CurrentUser() user: AuthUser,
    @Body() switchCoachDto: SwitchCoachContextDto
  ) {
    if (user.type !== UserType.client) {
      throw new BadRequestException('Only clients can switch coach context');
    }

    // This would be implemented in ClientAuthService
    // return this.clientAuthService.switchCoachContext(user.id, switchCoachDto.coachID);
    throw new BadRequestException('Not implemented yet');
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
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCode(verifyCodeDto);
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
  async logout() {
    return { message: 'Logged out successfully' };
  }

  // ========== PROTECTED ENDPOINTS ==========
  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar', {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(new BadRequestException('Only image files are allowed'), false);
      }
      callback(null, true);
    },
  }))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  async uploadAvatar(@CurrentUser() user: AuthUser, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    return this.authService.uploadAvatar(user.id, user.type, file);
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
