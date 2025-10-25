import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PresenceService } from './presence.service';
import { UserType } from '@nlc-ai/api-types';

@ApiTags('Presence')
@Controller('presence')
@ApiBearerAuth()
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get(':userType/:userID')
  @ApiOperation({ summary: 'Check if user is online' })
  @ApiResponse({ status: 200, description: 'User online status' })
  async checkOnlineStatus(
    @Param('userID') userID: string,
    @Param('userType') userType: UserType,
  ) {
    const isOnline = await this.presenceService.isOnline(userID, userType);
    const lastSeen = await this.presenceService.getLastSeen(userID, userType);

    return {
      userID,
      userType,
      isOnline,
      lastSeen: lastSeen ? new Date(lastSeen).toISOString() : null,
    };
  }

  @Get('batch')
  @ApiOperation({ summary: 'Check online status for multiple users' })
  @ApiResponse({ status: 200, description: 'Batch online status' })
  async checkBatchOnlineStatus(
    @Query('userIDs') userIDs: string,
    @Query('userTypes') userTypes: string,
  ) {
    const userIDsArray = userIDs.split(',');
    const userTypesArray = userTypes.split(',') as UserType[];

    const onlineUsers = await this.presenceService.getOnlineUsers(userIDsArray, userTypesArray);

    return {
      users: userIDsArray.map((userID, index) => ({
        userID,
        userType: userTypesArray[index],
        isOnline: onlineUsers.has(`${userTypesArray[index]}:${userID}`),
      })),
    };
  }
}
