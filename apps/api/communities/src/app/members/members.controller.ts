import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser, UserTypes } from '@nlc-ai/api-auth';
import { type AuthUser, UserType } from '@nlc-ai/types';
import { MembersService } from './members.service';
import {
  AddMemberDto,
  CommunityMemberFiltersDto,
  InviteMemberDto,
} from './dto';

@ApiTags('Community Members')
@Controller(':communityID/members')
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @ApiOperation({ summary: 'Add member to community' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @UserTypes(UserType.COACH, UserType.ADMIN)
  async addMember(
    @Param('communityID') communityID: string,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.membersService.addMemberToCommunity(
      communityID,
      addMemberDto.userID,
      addMemberDto.userType,
      addMemberDto.role,
      user.id
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get community members' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Members retrieved successfully' })
  async getCommunityMembers(
    @Param('communityID') communityID: string,
    @Query() filters: CommunityMemberFiltersDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.membersService.getCommunityMembers(communityID, filters, user);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user\'s membership in community' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Membership retrieved successfully' })
  async getMyMembership(
    @Param('communityID') communityID: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.membersService.getUserMembership(communityID, user);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get community member statistics' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Member statistics retrieved successfully' })
  async getCommunityMemberStats(
    @Param('communityID') communityID: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.membersService.getCommunityMemberStats(communityID);
  }

  @Patch(':memberID/role')
  @ApiOperation({ summary: 'Update member role' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiParam({ name: 'memberID', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Member role updated successfully' })
  @UserTypes(UserType.COACH, UserType.ADMIN)
  async updateMemberRole(
    @Param('communityID') communityID: string,
    @Param('memberID') memberID: string,
    @Body() body: { role: string },
    @CurrentUser() user: AuthUser
  ) {
    return this.membersService.updateMemberRole(
      communityID,
      memberID,
      body.role,
      user
    );
  }

  @Patch(':memberID/status')
  @ApiOperation({ summary: 'Update member status' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiParam({ name: 'memberID', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Member status updated successfully' })
  @UserTypes(UserType.COACH, UserType.ADMIN)
  async updateMemberStatus(
    @Param('communityID') communityID: string,
    @Param('memberID') memberID: string,
    @Body() body: { status: string },
    @CurrentUser() user: AuthUser
  ) {
    return this.membersService.updateMemberStatus(
      communityID,
      memberID,
      body.status,
      user
    );
  }

  @Delete(':userID/:userType')
  @ApiOperation({ summary: 'Remove member from community' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiParam({ name: 'userID', description: 'User ID' })
  @ApiParam({ name: 'userType', description: 'User Type' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @UserTypes(UserType.COACH, UserType.ADMIN)
  async removeMember(
    @Param('communityID') communityID: string,
    @Param('userID') userID: string,
    @Param('userType') userType: UserType,
    @CurrentUser() user: AuthUser
  ) {
    return this.membersService.removeMemberFromCommunity(
      communityID,
      userID,
      userType,
      user,
    );
  }

  @Post('invites')
  @ApiOperation({ summary: 'Invite member to community' })
  @ApiParam({ name: 'communityID', description: 'Community ID' })
  @ApiResponse({ status: 201, description: 'Invitation sent successfully' })
  @UserTypes(UserType.COACH, UserType.ADMIN)
  async inviteMember(
    @Param('communityID') communityID: string,
    @Body() inviteDto: InviteMemberDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.membersService.inviteMemberToCommunity(
      communityID,
      inviteDto.userID,
      inviteDto.userType,
      user.id,
      user.type,
      inviteDto.message
    );
  }
}
