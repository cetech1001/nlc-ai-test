import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto';
import { JwtAuthGuard, UserTypesGuard, UserTypes, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';

@ApiTags('Profiles')
@Controller('profiles')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@ApiBearerAuth()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('lookup/:userType/:id')
  @UserTypes(UserType.admin, UserType.coach, UserType.client)
  @ApiOperation({ summary: 'Lookup user profile by type and ID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  lookupUserProfile(
    @Param('userType') userType: UserType,
    @Param('id') id: string,
  ) {
    return this.profilesService.lookupProfile(userType, id);
  }

  @Get(':userType/:id')
  @UserTypes(UserType.admin, UserType.coach, UserType.client)
  @ApiOperation({ summary: 'Get user profile by type and ID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  getProfile(
    @Param('userType') userType: UserType,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    // Users can only view their own profile unless they're admin
    if (user.type !== UserType.admin && (user.id !== id || user.type !== userType)) {
      throw new ForbiddenException('Access denied');
    }

    return this.profilesService.getProfile(userType, id);
  }

  @Patch(':userType/:id')
  @UserTypes(UserType.admin, UserType.coach, UserType.client)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(
    @Param('userType') userType: UserType,
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: AuthUser
  ) {
    // Users can only update their own profile unless they're admin
    if (user.type !== UserType.admin && (user.id !== id || user.type !== userType)) {
      throw new ForbiddenException('Access denied');
    }

    return this.profilesService.updateProfile(userType, id, updateProfileDto);
  }
}
