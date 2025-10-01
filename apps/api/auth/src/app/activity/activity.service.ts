import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { UserType } from '@nlc-ai/types';
import type { Request } from 'express';

export interface LoginActivityData {
  userID: string;
  userType: UserType;
  ipAddress?: string;
  userAgent?: string;
  loginMethod?: 'password' | 'google';
  success?: boolean;
  failureReason?: string;
}

export interface ActivityHeatmapData {
  date: string;
  count: number;
}

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async recordLogin(data: LoginActivityData, req?: Request) {
    const deviceInfo = this.parseUserAgent(data.userAgent);

    await this.prisma.loginActivity.create({
      data: {
        userID: data.userID,
        userType: data.userType,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deviceType: deviceInfo.deviceType,
        platform: deviceInfo.platform,
        browser: deviceInfo.browser,
        loginMethod: data.loginMethod || 'password',
        success: data.success ?? true,
        failureReason: data.failureReason,
      },
    });
  }

  async getUserLoginActivity(
    userID: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ActivityHeatmapData[]> {
    const start = startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
    const end = endDate || new Date();

    const activities = await this.prisma.loginActivity.groupBy({
      by: ['loginAt'],
      where: {
        userID,
        success: true,
        loginAt: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        loginAt: 'asc',
      },
    });

    // Group by date (removing time)
    const activityMap = new Map<string, number>();

    activities.forEach((activity) => {
      const date = activity.loginAt.toISOString().split('T')[0];
      const current = activityMap.get(date) || 0;
      activityMap.set(date, current + activity._count.id);
    });

    return Array.from(activityMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }

  async getUserLoginStats(userID: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalLogins, recentLogins, lastLogin] = await Promise.all([
      this.prisma.loginActivity.count({
        where: { userID, success: true },
  }),
      this.prisma.loginActivity.count({
        where: {
          userID,
          success: true,
          loginAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.loginActivity.findFirst({
        where: { userID, success: true },
        orderBy: { loginAt: 'desc' },
        select: { loginAt: true },
      }),
    ]);

    return {
      totalLogins,
      recentLogins,
      lastLoginAt: lastLogin?.loginAt,
    };
  }

  private parseUserAgent(userAgent?: string) {
    if (!userAgent) {
      return {
        deviceType: 'unknown',
        platform: 'unknown',
        browser: 'unknown',
      };
    }

    const ua = userAgent.toLowerCase();

    // Detect device type
    let deviceType = 'desktop';
    if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(ua)) {
      deviceType = 'tablet';
    }

    // Detect platform
    let platform = 'unknown';
    if (/windows/i.test(ua)) platform = 'Windows';
    else if (/mac os x/i.test(ua)) platform = 'macOS';
    else if (/linux/i.test(ua)) platform = 'Linux';
    else if (/android/i.test(ua)) platform = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) platform = 'iOS';

    // Detect browser
    let browser = 'unknown';
    if (/edg/i.test(ua)) browser = 'Edge';
    else if (/chrome/i.test(ua)) browser = 'Chrome';
    else if (/safari/i.test(ua)) browser = 'Safari';
    else if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/opera|opr/i.test(ua)) browser = 'Opera';

    return { deviceType, platform, browser };
  }
}
