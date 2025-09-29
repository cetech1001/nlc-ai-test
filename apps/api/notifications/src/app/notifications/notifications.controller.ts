import { Controller, Get, Put, Delete, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@nlc-ai/api-auth';
import {type AuthUser, UserType} from '@nlc-ai/api-types';
import { NotificationsService } from './notifications.service';
import {NotificationFiltersDto} from "./dto";

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(
    @CurrentUser() user: AuthUser,
    @Query() filters: NotificationFiltersDto,
  ) {
    return this.notificationsService.getNotifications(user, filters);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@CurrentUser() user: AuthUser) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Put(':notificationID/read')
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
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(
    @CurrentUser('id') userID: string,
    @CurrentUser('type') userType: UserType,
  ) {
    return this.notificationsService.markAllAsRead(userID, userType);
  }

  @Delete(':notificationID')
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
