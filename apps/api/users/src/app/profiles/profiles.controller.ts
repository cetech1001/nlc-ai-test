import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Post,
  HttpCode,
  HttpStatus, Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto, UpdatePasswordDto, FollowCoachDto } from './dto';
import { UserTypesGuard, UserTypes, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/types';

@ApiTags('Profiles')
@Controller('profiles')
@UseGuards(UserTypesGuard)
@ApiBearerAuth()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyProfile(@CurrentUser() user: AuthUser) {
    return this.profilesService.getProfile(user.type, user.id);
  }

  @Patch('me')
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateMyProfile(
    @CurrentUser() user: AuthUser,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    return this.profilesService.updateProfile(user.type, user.id, updateProfileDto);
  }

  @Patch('me/password')
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({ summary: 'Update current user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid password format or current password incorrect' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMyPassword(
    @CurrentUser() user: AuthUser,
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    return this.profilesService.updatePassword(user.id, user.type, updatePasswordDto);
  }

  @Post('me/upload-avatar')
  @HttpCode(HttpStatus.OK)
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({ summary: 'Upload current user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No avatar URL provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadMyAvatar(
    @CurrentUser() user: AuthUser,
    @Body('avatarUrl') avatarUrl: string
  ) {
    return this.profilesService.uploadAvatar(user.id, user.type, avatarUrl);
  }

  @Get('lookup/:userType/:id')
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({
    summary: 'Lookup public user profile by type and ID',
    description: 'Get basic public profile information for any user. Useful for displaying user info in mentions, lists, etc.'
  })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  lookupUserProfile(
    @Param('userType') userType: UserType,
    @Param('id') id: string,
  ) {
    return this.profilesService.lookupProfile(userType, id);
  }

  @Get('stats/:userType/:id')
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Get public statistics for a user (posts, comments, etc.)'
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserStats(
    @Param('userType') userType: UserType,
    @Param('id') id: string
  ) {
    return this.profilesService.getUserStats(id, userType);
  }

  // Add these endpoints to apps/api/users/src/app/profiles/profiles.controller.ts

  @Post('follow')
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({ summary: 'Follow a coach' })
  @ApiResponse({ status: 200, description: 'Successfully followed coach' })
  @ApiResponse({ status: 400, description: 'Cannot follow yourself' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  @ApiResponse({ status: 409, description: 'Already following this coach' })
  async followCoach(
    @CurrentUser() user: AuthUser,
    @Body() followCoachDto: FollowCoachDto
  ) {
    return this.profilesService.followCoach(
      user.id,
      user.type,
      followCoachDto.coachID
    );
  }

  @Delete('follow/:coachID')
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({ summary: 'Unfollow a coach' })
  @ApiResponse({ status: 200, description: 'Successfully unfollowed coach' })
  @ApiResponse({ status: 404, description: 'Follow relationship not found' })
  async unfollowCoach(
    @CurrentUser() user: AuthUser,
    @Param('coachID') coachID: string
  ) {
    return this.profilesService.unfollowCoach(user.id, user.type, coachID);
  }

  @Get('follow-status/:coachID')
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({ summary: 'Check if following a coach' })
  @ApiResponse({ status: 200, description: 'Follow status retrieved' })
  async checkFollowStatus(
    @CurrentUser() user: AuthUser,
    @Param('coachID') coachID: string
  ) {
    const isFollowing = await this.profilesService.checkFollowStatus(
      user.id,
      user.type,
      coachID
    );
    return { isFollowing };
  }

  @Get('follow-counts/:coachID')
  @UserTypes(UserType.ADMIN, UserType.COACH, UserType.CLIENT)
  @ApiOperation({ summary: 'Get follower and following counts for a coach' })
  @ApiResponse({ status: 200, description: 'Counts retrieved successfully' })
  async getFollowCounts(@Param('coachID') coachID: string) {
    return this.profilesService.getFollowCounts(coachID);
  }
}
