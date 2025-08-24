import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';

@Injectable()
export class AdminAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData() {
    const [
      revenueStats,
      coachStats,
      revenueData,
      recentCoaches
    ] = await Promise.all([
      this.getRevenueStats(),
      this.getCoachStats(),
      this.getRevenueData(),
      this.getRecentCoaches()
    ]);

    return {
      ...revenueStats,
      ...coachStats,
      revenueData,
      recentCoaches
    };
  }

  async getRevenueStats() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const startOfLastMonth = new Date(year, month - 1, 1);
    const endOfLastMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const startOfLastYear = new Date(year - 1, 0, 1);
    const endOfLastYear = new Date(year - 1, 11, 31, 23, 59, 59, 999);
    const startOfThisYear = new Date(year, 0, 1);

    const [
      allTimeRevenue,
      lastYearRevenue,
      thisYearRevenue,
      monthlyRevenue,
      lastMonthRevenue
    ] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      }),
      this.prisma.transaction.aggregate({
        where: {
          status: 'completed',
          createdAt: {
            gte: startOfLastYear,
            lte: endOfLastYear
          }
        },
        _sum: { amount: true }
      }),
      this.prisma.transaction.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: startOfThisYear }
        },
        _sum: { amount: true }
      }),
      this.prisma.transaction.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),
      this.prisma.transaction.aggregate({
        where: {
          status: 'completed',
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: { amount: true }
      })
    ]);

    const allTimeRevenueGrowth = (lastYearRevenue._sum.amount || 0) > 0
      ? (((thisYearRevenue._sum.amount || 0) - (lastYearRevenue._sum.amount || 0)) / (lastYearRevenue._sum.amount || 1)) * 100
      : 0;

    const monthlyRevenueGrowth = (lastMonthRevenue._sum.amount || 0) > 0
      ? (((monthlyRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0)) / (lastMonthRevenue._sum.amount || 1)) * 100
      : 0;

    return {
      allTimeRevenue: Math.round((allTimeRevenue._sum.amount || 0) / 100),
      allTimeRevenueGrowth: Math.round(allTimeRevenueGrowth * 100) / 100,
      monthlyRevenue: Math.round((monthlyRevenue._sum.amount || 0) / 100),
      monthlyRevenueGrowth: Math.round(monthlyRevenueGrowth * 100) / 100,
    };
  }

  async getCoachStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

    const [
      totalCoaches,
      inactiveCoaches,
      newCoachesThisMonth,
      newCoachesLastMonth,
      inactiveCoachesThisMonth,
      inactiveCoachesLastMonth
    ] = await Promise.all([
      this.prisma.coach.count({
        where: { isDeleted: false }
      }),
      this.prisma.coach.count({
        where: {
          isActive: false,
          isDeleted: false
        }
      }),
      this.prisma.coach.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          isDeleted: false
        }
      }),
      this.prisma.coach.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          },
          isDeleted: false
        }
      }),
      this.prisma.coach.count({
        where: {
          isActive: false,
          updatedAt: { gte: thirtyDaysAgo },
          isDeleted: false
        }
      }),
      this.prisma.coach.count({
        where: {
          isActive: false,
          updatedAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          },
          isDeleted: false
        }
      })
    ]);

    const totalCoachesGrowth = newCoachesLastMonth > 0
      ? ((newCoachesThisMonth - newCoachesLastMonth) / newCoachesLastMonth) * 100
      : newCoachesThisMonth > 0 ? 100 : 0;

    const inactiveCoachesGrowth = inactiveCoachesLastMonth > 0
      ? ((inactiveCoachesThisMonth - inactiveCoachesLastMonth) / inactiveCoachesLastMonth) * 100
      : inactiveCoachesThisMonth > 0 ? 100 : 0;

    return {
      totalCoaches,
      inactiveCoaches,
      totalCoachesGrowth: Math.round(totalCoachesGrowth * 100) / 100,
      inactiveCoachesGrowth: Math.round(inactiveCoachesGrowth * 100) / 100,
    };
  }

  async getRevenueData() {
    const [weeklyData, monthlyData, yearlyData] = await Promise.all([
      this.getWeeklyRevenueData(),
      this.getMonthlyRevenueData(),
      this.getYearlyRevenueData()
    ]);

    return {
      weekly: weeklyData,
      monthly: monthlyData,
      yearly: yearlyData
    };
  }

  private async getWeeklyRevenueData() {
    const now = new Date();
    const dailyRevenue = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const startOfDay = this.startOfDay(date);
      const endOfDay = this.endOfDay(date);

      const revenue = await this.prisma.transaction.aggregate({
        where: {
          status: 'completed',
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        _sum: { amount: true }
      });

      dailyRevenue.push({
        period: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: Math.round((revenue._sum.amount || 0) / 100),
        date: date.toISOString().split('T')[0]
      });
    }

    const thisWeekTotal = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);

    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(lastWeekStart.getDate() - 13);
    const lastWeekEnd = new Date(now);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

    const lastWeekRevenue = await this.prisma.transaction.aggregate({
      where: {
        status: 'completed',
        createdAt: {
          gte: lastWeekStart,
          lt: lastWeekEnd
        }
      },
      _sum: { amount: true }
    });
    const lastWeekTotal = Math.round((lastWeekRevenue._sum.amount || 0) / 100);

    const growthPercentage = lastWeekTotal > 0
      ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100
      : 0;

    const growthText = growthPercentage >= 0 ? "grown" : "decreased";
    const growthDescription = `Your earnings has ${growthText} ${Math.abs(growthPercentage).toFixed(1)}% since last week`;

    return {
      data: dailyRevenue,
      growthPercentage,
      growthDescription,
    };
  }

  private async getMonthlyRevenueData() {
    const now = new Date();
    const weeklyRevenue = [];
    const startOfMonth = this.startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    let weekStart = new Date(startOfMonth);
    let weekNumber = 1;

    while (weekStart.getMonth() === now.getMonth()) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      if (weekEnd.getMonth() > now.getMonth()) {
        weekEnd.setDate(0);
        weekEnd.setMonth(now.getMonth() + 1);
      }

      const revenue = await this.prisma.transaction.aggregate({
        where: {
          status: 'completed',
          createdAt: {
            gte: weekStart,
            lt: weekEnd
          }
        },
        _sum: { amount: true }
      });

      weeklyRevenue.push({
        period: `Week ${weekNumber}`,
        revenue: Math.round((revenue._sum.amount || 0) / 100),
        date: weekStart.toISOString().split('T')[0]
      });

      weekStart = new Date(weekEnd);
      weekNumber++;
    }

    const thisMonthTotal = weeklyRevenue.reduce((sum, week) => sum + week.revenue, 0);

    const lastMonthStart = this.startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const lastMonthEnd = this.endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));

    const lastMonthRevenue = await this.prisma.transaction.aggregate({
      where: {
        status: 'completed',
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      },
      _sum: { amount: true }
    });

    const lastMonthTotal = Math.round((lastMonthRevenue._sum.amount || 0) / 100);
    const growthPercentage = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    const growthText = growthPercentage >= 0 ? "grown" : "decreased";
    const growthDescription = `Your earnings has ${growthText} ${Math.abs(growthPercentage).toFixed(1)}% since last month`;

    return {
      data: weeklyRevenue,
      growthPercentage,
      growthDescription,
    };
  }

  private async getYearlyRevenueData() {
    const now = new Date();
    const monthlyRevenue = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 12; i++) {
      const monthStart = this.startOfDay(new Date(now.getFullYear(), i, 1));
      const monthEnd = this.endOfDay(new Date(now.getFullYear(), i + 1, 0));

      const revenue = await this.prisma.transaction.aggregate({
        where: {
          status: 'completed',
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: { amount: true }
      });

      monthlyRevenue.push({
        period: months[i],
        revenue: Math.round((revenue._sum.amount || 0) / 100),
        date: monthStart.toISOString().split('T')[0]
      });
    }

    const thisYearTotal = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);

    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

    const lastYearRevenue = await this.prisma.transaction.aggregate({
      where: {
        status: 'completed',
        createdAt: {
          gte: lastYearStart,
          lte: lastYearEnd
        }
      },
      _sum: { amount: true }
    });

    const lastYearTotal = Math.round((lastYearRevenue._sum.amount || 0) / 100);
    const growthPercentage = lastYearTotal > 0
      ? ((thisYearTotal - lastYearTotal) / lastYearTotal) * 100
      : 0;

    const growthText = growthPercentage >= 0 ? "grown" : "decreased";
    const growthDescription = `Your earnings has ${growthText} ${Math.abs(growthPercentage).toFixed(2)}% since last year`;

    return {
      data: monthlyRevenue,
      growthPercentage,
      growthDescription,
    };
  }

  private async getRecentCoaches() {
    const coaches = await this.prisma.coach.findMany({
      take: 6,
      where: { isDeleted: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        businessName: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        subscriptionStatus: true,
        _count: {
          select: {
            clientCoaches: {
              where: { status: 'active' }
            }
          }
        },
        transactions: {
          where: { status: 'completed' },
          select: { amount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return coaches.map(coach => ({
      id: coach.id,
      firstName: coach.firstName,
      lastName: coach.lastName,
      email: coach.email,
      businessName: coach.businessName,
      isActive: coach.isActive,
      isVerified: coach.isVerified,
      createdAt: coach.createdAt,
      subscriptionStatus: coach.subscriptionStatus,
      clientCount: coach._count.clientCoaches,
      totalRevenue: Math.round(
        (coach.transactions.reduce((sum, transaction) => sum + transaction.amount, 0)) / 100
      )
    }));
  }

  async getTransactionStats() {
    const [totalTransactions, completedTransactions, pendingTransactions, failedTransactions, totalRevenue] = await Promise.all([
      this.prisma.transaction.count(),
      this.prisma.transaction.count({ where: { status: 'completed' } }),
      this.prisma.transaction.count({ where: { status: 'pending' } }),
      this.prisma.transaction.count({ where: { status: 'failed' } }),
      this.prisma.transaction.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      })
    ]);

    return {
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      totalRevenue: Math.round((totalRevenue._sum.amount || 0) / 100),
    };
  }

  async getCoachPerformance() {
    const topPerformingCoaches = await this.prisma.coach.findMany({
      take: 10,
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

    return {
      topPerformingCoaches: topPerformingCoaches.map(coach => ({
        id: coach.id,
        name: `${coach.firstName} ${coach.lastName}`,
        email: coach.email,
        businessName: coach.businessName,
        activeClients: coach._count.clientCoaches,
        totalRevenue: Math.round(
          (coach.transactions.reduce((sum, transaction) => sum + transaction.amount, 0)) / 100
        )
      }))
    };
  }

  async getRevenueTrends() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const monthlyTrends = await this.prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', created_at) as month,
        SUM(amount) as revenue,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE status = 'completed'
        AND created_at >= ${startOfYear}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `;

    return {
      monthlyTrends: (monthlyTrends as any[]).map(trend => ({
        month: trend.month,
        revenue: Math.round(Number(trend.revenue) / 100),
        transactionCount: Number(trend.transaction_count)
      }))
    };
  }

  private startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private endOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }
}
