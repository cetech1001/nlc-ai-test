import { Controller, Get, Put, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import {type AuthUser, UserType} from '@nlc-ai/api-types';
import { NotificationsService } from './notifications.service';
import {NotificationFiltersDto} from "./dto";

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UserTypes(UserType.coach, UserType.admin, UserType.client)
  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(
    @CurrentUser() user: AuthUser,
    @Query() filters: NotificationFiltersDto,
  ) {
    return this.notificationsService.getNotifications(user, filters);
  }

  @Get('unread-count')
  @UserTypes(UserType.coach, UserType.admin, UserType.client)
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(
    @CurrentUser('id') userID: string,
    @CurrentUser('type') userType: UserType,
  ) {
    return this.notificationsService.getUnreadCount(userID, userType);
  }

  @Put(':notificationID/read')
  @UserTypes(UserType.coach, UserType.admin, UserType.client)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @CurrentUser('id') userID: string,
    @CurrentUser('type') userType: UserType,
    @Param('notificationID') notificationID: string,
  ) {
    return this.notificationsService.markAsRead(userID, userType, notificationID);
  }

  @Put('mark-all-read')
  @UserTypes(UserType.coach, UserType.admin, UserType.client)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(
    @CurrentUser('id') userID: string,
    @CurrentUser('type') userType: UserType,
  ) {
    return this.notificationsService.markAllAsRead(userID, userType);
  }

  @Delete(':notificationID')
  @UserTypes(UserType.coach, UserType.admin, UserType.client)
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  async deleteNotification(
    @CurrentUser('id') userID: string,
    @CurrentUser('type') userType: UserType,
    @Param('notificationID') notificationID: string,
  ) {
    return this.notificationsService.deleteNotification(userID, userType, notificationID);
  }
}
