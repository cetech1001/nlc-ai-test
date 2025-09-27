import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  ForbiddenException, Post, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto';
import { JwtAuthGuard, UserTypesGuard, UserTypes, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/types';

@ApiTags('Profiles')
@Controller('profiles')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@ApiBearerAuth()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('lookup/:userType/:id')
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({ summary: 'Lookup user profile by type and ID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  lookupUserProfile(
    @Param('userType') userType: UserType,
    @Param('id') id: string,
  ) {
    return this.profilesService.lookupProfile(userType, id);
  }

  @Get(':userType/:id')
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({ summary: 'Get user profile by type and ID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  getProfile(
    @Param('userType') userType: UserType,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    // Users can only view their own profile unless they're admin
    if (user.type !== UserType.ADMIN && (user.id !== id || user.type !== userType)) {
      throw new ForbiddenException('Access denied');
    }

    return this.profilesService.getProfile(userType, id);
  }

  @Patch(':userType/:id')
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(
    @Param('userType') userType: UserType,
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: AuthUser
  ) {
    // Users can only update their own profile unless they're admin
    if (user.type !== UserType.ADMIN && (user.id !== id || user.type !== userType)) {
      throw new ForbiddenException('Access denied');
    }

    return this.profilesService.updateProfile(userType, id, updateProfileDto);
  }

  // Add these controller methods
  @Get('profile/:userID/:userType')
  @ApiOperation({ summary: 'Get user profile' })
  async getUserProfile(
    @Param('userID') userID: string,
    @Param('userType') userType: UserType
  ) {
    return this.profilesService.getUserProfile(userID, userType);
  }

  @Get('stats/:userID/:userType')
  @ApiOperation({ summary: 'Get user stats' })
  async getUserStats(
    @Param('userID') userID: string,
    @Param('userType') userType: UserType
  ) {
    return this.profilesService.getUserStats(userID, userType);
  }

  @Post('upload-avatar')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No avatar URL found' })
  async uploadAvatar(@CurrentUser() user: AuthUser, @Body('avatarUrl') avatarUrl: string) {
    return this.profilesService.uploadAvatar(user.id, user.type, avatarUrl);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: AuthUser) {
    const { id, type } = user;
    return this.profilesService.findUserByID(id, type);
  }

  @Patch('profile')
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
    return this.profilesService.updateProfile(id, type, updateProfileDto);
  }

  @Patch('password')
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
    return this.profilesService.updatePassword(id, type, updatePasswordDto);
  }
}
