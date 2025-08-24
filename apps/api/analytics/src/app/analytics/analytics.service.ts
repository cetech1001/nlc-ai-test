import {Injectable} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {AnalyticsQueryDto} from './dto';
import {ClientCoachStatus} from "@prisma/client";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getPlatformAnalytics(query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    const [
      totalUsers,
      activeUsers,
      newSignups,
      retentionData,
      revenueData
    ] = await Promise.all([
      this.getTotalUserCounts(),
      this.getActiveUserCounts(startDate, endDate),
      this.getNewSignups(startDate, endDate),
      this.getRetentionData(startDate, endDate),
      this.getRevenueData(startDate, endDate)
    ]);

    return {
      period: { startDate, endDate },
      overview: {
        totalUsers,
        activeUsers,
        newSignups,
      },
      retention: retentionData,
      revenue: revenueData,
    };
  }

  async getCoachesOverview(query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    const [
      totalCoaches,
      activeCoaches,
      coachesByPlan,
      coachGrowth,
      topPerformingCoaches
    ] = await Promise.all([
      this.prisma.coach.count({ where: { isActive: true, isDeleted: false } }),
      this.getActiveCoaches(startDate, endDate),
      this.getCoachesByPlan(),
      this.getCoachGrowthData(startDate, endDate),
      this.getTopPerformingCoaches(5)
    ]);

    return {
      period: { startDate, endDate },
      overview: {
        totalCoaches,
        activeCoaches,
        coachesByPlan,
      },
      growth: coachGrowth,
      topPerformers: topPerformingCoaches,
    };
  }

  async getClientsOverview(query: AnalyticsQueryDto, coachID?: string) {
    const { startDate, endDate } = this.getDateRange(query);

    const whereClause = coachID ? {
      clientCoaches: {
        some: {
          coachID,
          status: ClientCoachStatus.active,
        }
      }
    } : {};

    const [
      totalClients,
      activeClients,
      clientGrowth,
      engagementMetrics,
      topClients
    ] = await Promise.all([
      this.prisma.client.count({ where: { ...whereClause, isActive: true } }),
      this.getActiveClients(startDate, endDate, coachID),
      this.getClientGrowthData(startDate, endDate, coachID),
      this.getClientEngagementMetrics(startDate, endDate, coachID),
      this.getTopEngagedClients(5, coachID)
    ]);

    return {
      period: { startDate, endDate },
      overview: {
        totalClients,
        activeClients,
      },
      growth: clientGrowth,
      engagement: engagementMetrics,
      topClients,
    };
  }

  async getCoachDetailedAnalytics(coachID: string, query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    const [
      coachProfile,
      clientMetrics,
      revenueMetrics,
      engagementMetrics,
      performanceMetrics
    ] = await Promise.all([
      this.getCoachProfile(coachID),
      this.getCoachClientMetrics(coachID, startDate, endDate),
      this.getCoachRevenueMetrics(coachID, startDate, endDate),
      this.getCoachEngagementMetrics(coachID, startDate, endDate),
      this.getCoachPerformanceMetrics(coachID, startDate, endDate)
    ]);

    return {
      period: { startDate, endDate },
      coach: coachProfile,
      clients: clientMetrics,
      revenue: revenueMetrics,
      engagement: engagementMetrics,
      performance: performanceMetrics,
    };
  }

  async getEngagementTrends(query: AnalyticsQueryDto, coachID?: string) {
    const { startDate, endDate } = this.getDateRange(query);

    const dailyData = await this.getDailyEngagementTrends(startDate, endDate, coachID);
    const weeklyData = await this.getWeeklyEngagementTrends(startDate, endDate, coachID);

    return {
      period: { startDate, endDate },
      daily: dailyData,
      weekly: weeklyData,
    };
  }

  // Helper methods
  private getDateRange(query: AnalyticsQueryDto) {
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate ? new Date(query.startDate) : new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));

    return { startDate, endDate };
  }

  private async getTotalUserCounts() {
    const [coaches, clients, admins] = await Promise.all([
      this.prisma.coach.count({ where: { isActive: true, isDeleted: false } }),
      this.prisma.client.count({ where: { isActive: true } }),
      this.prisma.admin.count({ where: { isActive: true } })
    ]);

    return { coaches, clients, admins, total: coaches + clients + admins };
  }

  private async getActiveUserCounts(startDate: Date, endDate: Date) {
    const [coaches, clients] = await Promise.all([
      this.prisma.coach.count({
        where: {
          isActive: true,
          isDeleted: false,
          lastLoginAt: { gte: startDate, lte: endDate }
        }
      }),
      this.prisma.client.count({
        where: {
          isActive: true,
          lastLoginAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    return { coaches, clients, total: coaches + clients };
  }

  private async getNewSignups(startDate: Date, endDate: Date) {
    const [coaches, clients] = await Promise.all([
      this.prisma.coach.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      this.prisma.client.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    return { coaches, clients, total: coaches + clients };
  }

  private async getRetentionData(startDate: Date, endDate: Date) {
    // Implement retention calculation logic
    // This is a simplified version
    const activeUsers = await this.getActiveUserCounts(startDate, endDate);
    const totalUsers = await this.getTotalUserCounts();

    return {
      coachRetention: totalUsers.coaches > 0 ? (activeUsers.coaches / totalUsers.coaches) * 100 : 0,
      clientRetention: totalUsers.clients > 0 ? (activeUsers.clients / totalUsers.clients) * 100 : 0,
    };
  }

  private async getRevenueData(startDate: Date, endDate: Date) {
    const revenue = await this.prisma.transaction.aggregate({
      where: {
        status: 'completed',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true },
      _count: true
    });

    return {
      totalRevenue: Math.round((revenue._sum.amount || 0) / 100),
      transactionCount: revenue._count,
    };
  }

  private async getActiveCoaches(startDate: Date, endDate: Date) {
    return this.prisma.coach.count({
      where: {
        isActive: true,
        isDeleted: false,
        lastLoginAt: { gte: startDate, lte: endDate }
      }
    });
  }

  private async getCoachesByPlan() {
    const result = await this.prisma.subscription.groupBy({
      by: ['planID'],
      where: { status: 'active' },
      _count: true,
      // @ts-ignore
      include: {
        plan: {
          select: { name: true }
        }
      }
    });

    return result.map((item: any) => ({
      planName: item.plan?.name || 'Unknown',
      count: item._count
    }));
  }

  private async getCoachGrowthData(startDate: Date, endDate: Date) {
    // Implement daily/weekly coach registration data
    return this.prisma.$queryRaw`
      SELECT DATE (created_at) as date, COUNT (*) as count
      FROM coaches
      WHERE created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY DATE (created_at)
      ORDER BY date ASC
    `;
  }

  private async getTopPerformingCoaches(limit: number) {
    return this.prisma.coach.findMany({
      take: limit,
      where: { isActive: true, isDeleted: false },
      include: {
        _count: {
          select: {
            clientCoaches: { where: { status: 'active' } }
          }
        },
        transactions: {
          where: { status: 'completed' },
          select: { amount: true }
        }
      },
      orderBy: {
        clientCoaches: { _count: 'desc' }
      }
    });
  }

  private async getActiveClients(startDate: Date, endDate: Date, coachID?: string) {
    const whereClause = {
      isActive: true,
      lastLoginAt: { gte: startDate, lte: endDate },
      ...(coachID ? {
        clientCoaches: {
          some: {
            coachID,
            status: ClientCoachStatus.active,
          }
        }
      } : {})
    };

    return this.prisma.client.count({ where: whereClause });
  }

  private async getClientGrowthData(startDate: Date, endDate: Date, coachID?: string) {
    // Implementation for client growth tracking
    // This would return daily/weekly client registration data
    return [];
  }

  private async getClientEngagementMetrics(startDate: Date, endDate: Date, coachID?: string) {
    // Calculate average engagement scores, interaction frequency, etc.
    const avgEngagement = await this.prisma.client.aggregate({
      where: {
        ...(coachID ? {
          clientCoaches: {
            some: {
              coachID,
              status: 'active'
            }
          }
        } : {}),
        lastInteractionAt: { gte: startDate, lte: endDate }
      },
      _avg: { engagementScore: true },
      _count: true
    });

    return {
      averageEngagementScore: avgEngagement._avg.engagementScore || 0,
      activeClientsCount: avgEngagement._count,
    };
  }

  private async getTopEngagedClients(limit: number, coachID?: string) {
    return this.prisma.client.findMany({
      take: limit,
      where: {
        isActive: true,
        ...(coachID ? {
          clientCoaches: {
            some: {
              coachID,
              status: 'active'
            }
          }
        } : {})
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        engagementScore: true,
        totalInteractions: true,
        lastInteractionAt: true,
      },
      orderBy: {
        engagementScore: 'desc'
      }
    });
  }

  private async getCoachProfile(coachID: string) {
    return this.prisma.coach.findUnique({
      where: { id: coachID },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        businessName: true,
        email: true,
        createdAt: true,
        subscriptionStatus: true,
      }
    });
  }

  private async getCoachClientMetrics(coachID: string, startDate: Date, endDate: Date) {
    const [total, active, newClients] = await Promise.all([
      this.prisma.clientCoach.count({
        where: { coachID, status: 'active' }
      }),
      this.prisma.clientCoach.count({
        where: {
          coachID,
          status: 'active',
          client: {
            lastInteractionAt: { gte: startDate, lte: endDate }
          }
        }
      }),
      this.prisma.clientCoach.count({
        where: {
          coachID,
          assignedAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    return { total, active, newClients };
  }

  private async getCoachRevenueMetrics(coachID: string, startDate: Date, endDate: Date) {
    const revenue = await this.prisma.transaction.aggregate({
      where: {
        coachID,
        status: 'completed',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true },
      _count: true
    });

    return {
      totalRevenue: Math.round((revenue._sum.amount || 0) / 100),
      transactionCount: revenue._count,
    };
  }

  private async getCoachEngagementMetrics(coachID: string, startDate: Date, endDate: Date) {
    const engagement = await this.prisma.aiInteraction.aggregate({
      where: {
        coachID,
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: true,
      _sum: { tokensUsed: true }
    });

    return {
      totalInteractions: engagement._count,
      totalTokensUsed: engagement._sum.tokensUsed || 0,
    };
  }

  private async getCoachPerformanceMetrics(coachID: string, startDate: Date, endDate: Date) {
    // Calculate various performance metrics
    const [emailMetrics, courseMetrics] = await Promise.all([
      this.getEmailPerformanceMetrics(coachID, startDate, endDate),
      this.getCoursePerformanceMetrics(coachID, startDate, endDate)
    ]);

    return {
      email: emailMetrics,
      courses: courseMetrics,
    };
  }

  private async getEmailPerformanceMetrics(coachID: string, startDate: Date, endDate: Date) {
    const emailThreads = await this.prisma.emailThread.count({
      where: {
        coachID,
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    return { totalThreads: emailThreads };
  }

  private async getCoursePerformanceMetrics(coachID: string, startDate: Date, endDate: Date) {
    const enrollments = await this.prisma.courseEnrollment.count({
      where: {
        course: { coachID },
        enrolledAt: { gte: startDate, lte: endDate }
      }
    });

    return { totalEnrollments: enrollments };
  }

  private async getDailyEngagementTrends(startDate: Date, endDate: Date, coachID?: string) {
    // Implementation for daily engagement data
    return [];
  }

  private async getWeeklyEngagementTrends(startDate: Date, endDate: Date, coachID?: string) {
    // Implementation for weekly engagement data
    return [];
  }
}
