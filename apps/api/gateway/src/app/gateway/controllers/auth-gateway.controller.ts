import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProxyService } from '../../proxy/proxy.service';
import { CacheService } from '../../cache/cache.service';
import { Public } from '@nlc-ai/api-auth';

@ApiTags('Authentication')
@Controller('auth')
export class AuthGatewayController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly cacheService: CacheService,
  ) {}

  // ========== ADMIN AUTHENTICATION ==========
  @Post('admin/login')
  @Public()
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async loginAdmin(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/admin/login',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  // ========== COACH AUTHENTICATION ==========
  @Post('coaches/register')
  @Public()
  @ApiOperation({ summary: 'Register new coach' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  async registerCoach(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/coaches/register',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('coaches/login')
  @Public()
  @ApiOperation({ summary: 'Coach login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async loginCoach(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/coaches/login',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('coaches/google/auth')
  @Public()
  @ApiOperation({ summary: 'Coach Google OAuth' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  async coachGoogleAuth(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/coaches/google/auth',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  // ========== CLIENT AUTHENTICATION ==========
  @Post('client/register')
  @Public()
  @ApiOperation({ summary: 'Client registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  async registerClient(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/client/register',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('client/login')
  @Public()
  @ApiOperation({ summary: 'Client login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async loginClient(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/client/login',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('client/google/auth')
  @Public()
  @ApiOperation({ summary: 'Client Google OAuth' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  async clientGoogleAuth(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/client/google/auth',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('client/switch-coach')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Switch coach context for client' })
  @ApiResponse({ status: 200, description: 'Coach context switched successfully' })
  async switchCoachContext(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/client/switch-coach',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  // ========== COMMON AUTH ENDPOINTS ==========
  @Post('forgot-password')
  @Public()
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  async forgotPassword(@Body() body: any, @Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/forgot-password',
      {
        method: 'POST',
        data: body,
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('verify-code')
  @Public()
  @ApiOperation({ summary: 'Verify reset code or email verification code' })
  @ApiResponse({ status: 200, description: 'Code verified' })
  async verifyCode(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/verify-code',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('resend-code')
  @Public()
  @ApiOperation({ summary: 'Resend verification code' })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  async resendCode(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/resend-code',
      {
        method: 'POST',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('reset-password')
  @Public()
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() body: any, @Query() query: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/reset-password',
      {
        method: 'POST',
        data: body,
        params: query,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Post('logout')
  @Public()
  @ApiOperation({ summary: 'Logout' })
  async logout(@Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/logout',
      {
        method: 'POST',
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  // ========== PROTECTED ENDPOINTS ==========
  @Post('upload-avatar')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Res() res: Response) {
    // For file uploads, we need to forward the multipart data
    const formData = new FormData();
    if (file) {
      formData.append('avatar', new Blob([file.buffer]), file.originalname);
    }

    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/upload-avatar',
      {
        method: 'POST',
        data: formData,
        headers: {
          ...this.extractHeaders(req),
          'content-type': 'multipart/form-data',
        },
      }
    );

    return res.status(response.status).json(response.data);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Req() req: Request, @Res() res: Response) {
    // Check cache first
    const cacheKey = `profile:${req.headers.authorization}`;
    const cachedProfile = await this.cacheService.get(cacheKey);

    if (cachedProfile) {
      return res.json(cachedProfile);
    }

    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/profile',
      {
        method: 'GET',
        headers: this.extractHeaders(req),
      }
    );

    // Cache the profile for 5 minutes
    if (response.status === 200) {
      await this.cacheService.set(cacheKey, response.data, 300);
    }

    return res.status(response.status).json(response.data);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/profile',
      {
        method: 'PATCH',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    // Invalidate profile cache
    const cacheKey = `profile:${req.headers.authorization}`;
    await this.cacheService.delete(cacheKey);

    return res.status(response.status).json(response.data);
  }

  @Patch('password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  async updatePassword(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.proxyService.proxyRequest(
      'auth',
      '/api/auth/password',
      {
        method: 'PATCH',
        data: body,
        headers: this.extractHeaders(req),
      }
    );

    return res.status(response.status).json(response.data);
  }

  private extractHeaders(req: Request): Record<string, string> {
    return {
      'authorization': req.headers.authorization || '',
      'content-type': req.headers['content-type'] || 'application/json',
      'user-agent': req.headers['user-agent'] || '',
      'x-forwarded-for': req.headers['x-forwarded-for'] as string || req.ip || '',
      'x-real-ip': req.ip || '',
    };
  }
}
