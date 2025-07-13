import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {DashboardData, DashboardStats, RecentCoach, RevenueGrowthData} from "@nlc-ai/types";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const startOfMonth = this.startOfDay(new Date(year, month, 1));
    const startOfLastMonth = this.startOfDay(new Date(year, month - 1, 1));
    const endOfLastMonth = this.endOfDay(new Date(year, month, 0));
    const startOfLastYear = this.startOfDay(new Date(year - 1, 0, 1));
    const endOfLastYear = this.endOfDay(new Date(year - 1, 11, 31));
    const startOfThisYear = this.startOfDay(new Date(year, 0, 1));

    const thisMonthThreshold = startOfMonth;
    thisMonthThreshold.setDate(thisMonthThreshold.getDate() - 30);

    const lastMonthThreshold = startOfLastMonth;
    lastMonthThreshold.setDate(lastMonthThreshold.getDate() - 30);

    const [
      totalCoaches,
      totalCoachesLastMonth,
      inactiveCoaches,
      inactiveCoachesLastMonth,
    ] = await Promise.all([
      this.prisma.coaches.count(),
      this.prisma.coaches.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
        }
      }),
      this.prisma.coaches.count({
        where: {
          isActive: true,
          lastLoginAt: { lte: thisMonthThreshold }
        }
      }),
      this.prisma.coaches.count({
        where: {
          isActive: true,
          lastLoginAt: { lte: lastMonthThreshold },
        }
      }),
    ]);

    const [
      allTimeRevenue,
      lastYearRevenue,
      thisYearRevenue,
      monthlyRevenue,
      lastMonthRevenue
    ] = await Promise.all([
      this.prisma.transactions.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      }),
      this.prisma.transactions.aggregate({
        where: {
          status: 'completed',
          createdAt: {
            gte: startOfLastYear,
            lte: endOfLastYear
          }
        },
        _sum: { amount: true }
      }),
      this.prisma.transactions.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: startOfThisYear }
        },
        _sum: { amount: true }
      }),
      this.prisma.transactions.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),
      this.prisma.transactions.aggregate({
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

    const totalCoachesGrowth = totalCoachesLastMonth > 0
      ? ((totalCoaches - totalCoachesLastMonth) / totalCoachesLastMonth) * 100
      : 0;

    const inactiveCoachesGrowth = inactiveCoachesLastMonth > 0
      ? ((inactiveCoaches - inactiveCoachesLastMonth) / inactiveCoachesLastMonth) * 100
      : 0;

    const allTimeRevenueGrowth = (lastYearRevenue._sum.amount || 0) > 0
      ? (((thisYearRevenue._sum.amount || 0) - (lastYearRevenue._sum.amount || 0)) / (lastYearRevenue._sum.amount || 1)) * 100
      : 0;

    const monthlyRevenueGrowth = (lastMonthRevenue._sum.amount || 0) > 0
      ? (((monthlyRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0)) / (lastMonthRevenue._sum.amount || 1)) * 100
      : 0;

    return {
      totalCoaches,
      totalCoachesGrowth: Math.round(totalCoachesGrowth * 100) / 100,
      inactiveCoaches,
      inactiveCoachesGrowth: Math.round(inactiveCoachesGrowth * 100) / 100,
      allTimeRevenue: Math.round((allTimeRevenue._sum.amount || 0) / 100),
      allTimeRevenueGrowth: Math.round(allTimeRevenueGrowth * 100) / 100,
      monthlyRevenue: Math.round((monthlyRevenue._sum.amount || 0) / 100),
      monthlyRevenueGrowth: Math.round(monthlyRevenueGrowth * 100) / 100,
    };
  }

  private async getWeeklyRevenueData(): Promise<RevenueGrowthData> {
    const now = new Date();
    const dailyRevenue = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const startOfDay = this.startOfDay(date);
      const endOfDay = this.endOfDay(date);

      const revenue = await this.prisma.transactions.aggregate({
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
        period: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        revenue: Math.round((revenue._sum.amount || 0) / 100),
        date: date.toISOString().split('T')[0]
      });
    }

    const thisWeekTotal = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);

    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(lastWeekStart.getDate() - 13);

    const lastWeekEnd = new Date(now);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

    const lastWeekRevenue = await this.prisma.transactions.aggregate({
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
    }
  }

  private async getMonthlyRevenueData(): Promise<RevenueGrowthData> {
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

      const revenue = await this.prisma.transactions.aggregate({
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

    const lastMonthRevenue = await this.prisma.transactions.aggregate({
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

  private async getYearlyRevenueData(): Promise<RevenueGrowthData> {
    const now = new Date();
    const monthlyRevenue = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 12; i++) {
      const monthStart = this.startOfDay(new Date(now.getFullYear(), i, 1));
      const monthEnd = this.endOfDay(new Date(now.getFullYear(), i + 1, 0));

      const revenue = await this.prisma.transactions.aggregate({
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

    const lastYearRevenue = await this.prisma.transactions.aggregate({
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
    }
  }

  async getRevenueData(): Promise<DashboardData['revenueData']> {
    const [weekly, monthly, yearly] = await Promise.all([
      this.getWeeklyRevenueData(),
      this.getMonthlyRevenueData(),
      this.getYearlyRevenueData(),
    ]);

    return { weekly, monthly, yearly };
  }

  async getRecentCoaches(limit: number = 6): Promise<RecentCoach[]> {
    const coaches = await this.prisma.coaches.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            plan: true
          }
        }
      }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return coaches.map(coach => {
      let status = 'inactive';
      if (!coach.isActive) {
        status = 'blocked';
      } else if (coach.lastLoginAt && coach.lastLoginAt > thirtyDaysAgo) {
        status = 'active';
      }

      return {
        id: coach.id,
        name: `${coach.firstName} ${coach.lastName}`,
        email: coach.email,
        dateJoined: coach.createdAt?.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) || '',
        plan: coach.subscriptions[0]?.plan?.name || 'No Plan',
        status
      };
    });
  }

  async getDashboardData() {
    const [stats, revenueData, recentCoaches] = await Promise.all([
      this.getDashboardStats(),
      this.getRevenueData(),
      this.getRecentCoaches(6)
    ]);

    return {
      stats,
      revenueData,
      recentCoaches
    };
  }
}
