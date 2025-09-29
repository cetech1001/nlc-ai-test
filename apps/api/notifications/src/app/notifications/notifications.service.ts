import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import {AuthUser, UserType} from '@nlc-ai/api-types';
import {NotificationFiltersDto} from "./dto";

export interface CreateNotificationData {
  userID: string;
  userType: UserType;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createNotification(data: CreateNotificationData) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userID: data.userID,
          userType: data.userType.toString() as UserType,
          type: data.type,
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
          priority: data.priority || 'normal',
          metadata: data.metadata || {},
          isRead: false,
        },
      });

      this.logger.log(`Created notification: ${notification.id} for user ${data.userID}`);
      return notification;
    } catch (error) {
      this.logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  async getNotifications(
    user: AuthUser,
    options: NotificationFiltersDto = {}
  ) {
    const {
      isRead,
      type,
      priority,
      page = 1,
      limit = 20,
    } = options;

    const where: any = {
      userID: user.id,
      userType: user.type.toString(),
    };

    if (typeof isRead === 'boolean') {
      where.isRead = isRead;
    }

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority;
    }

    const [notifications, totalCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    };
  }

  async getUnreadCount(userID: string) {
    const count = await this.prisma.notification.count({
      where: {
        userID,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  async markAsRead(userID: string, userType: UserType, notificationID: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationID,
        userID,
        userType: userType.toString() as UserType,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.prisma.notification.update({
      where: { id: notificationID },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userID: string, userType: UserType) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userID,
        userType: userType.toString() as UserType,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: 'All notifications marked as read',
      updatedCount: result.count,
    };
  }

  async deleteNotification(userID: string, userType: UserType, notificationID: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationID,
        userID,
        userType: userType.toString() as UserType,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id: notificationID },
    });

    return { message: 'Notification deleted' };
  }

  async cleanupOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true,
      },
    });

    this.logger.log(`Cleaned up ${result.count} old notifications`);
    return result.count;
  }
}
