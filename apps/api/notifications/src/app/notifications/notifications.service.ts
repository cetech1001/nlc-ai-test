import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {UserType} from '@nlc-ai/api-types';
import {CreateNotificationDto, NotificationFiltersDto} from './dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(
    userID: string,
    userType: UserType,
    filters: NotificationFiltersDto,
  ) {
    const {
      isRead,
      priority,
      type,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {
      userID,
      userType,
    };

    if (typeof isRead === 'boolean') {
      where.isRead = isRead;
    }

    if (priority) {
      where.priority = priority;
    }

    if (type) {
      where.type = type;
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
      notifications,
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

  async getUnreadCount(userID: string, userType: UserType) {
    const count = await this.prisma.notification.count({
      where: {
        userID,
        userType,
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
        userType,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
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
        userType,
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

  async createNotification(createDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        ...createDto,
        isRead: false,
      },
    });

    return {
      message: 'Notification created successfully',
      notification,
    };
  }

  // Internal method for orchestrator
  async createInternalNotification(data: {
    userID: string;
    userType: UserType;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    priority?: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.notification.create({
      data: {
        ...data,
        isRead: false,
        priority: data.priority || 'normal',
        metadata: data.metadata || {},
      },
    });
  }
}
