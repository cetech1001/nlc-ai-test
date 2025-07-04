import {Controller, Get, UseGuards, Request, Patch, Body} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiBearerAuth, ApiResponse} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import {UpdateProfileDto} from "../dto/update-profile.dto";
import {UpdatePasswordDto} from "../dto/update-password.dto";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req: { user: { id: string; type: 'coach' | 'admin'; } }) {
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
    @Request() req: { user: { id: string; type: 'coach' | 'admin'; } },
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
    @Request() req: { user: { id: string; type: 'coach' | 'admin'; } },
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    const { id, type } = req.user;
    return this.authService.updatePassword(id, type, updatePasswordDto);
  }
}
