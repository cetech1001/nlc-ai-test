import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {DashboardStats, RecentCoach, RevenueData, RevenueGrowthData} from "@nlc-ai/types";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    const startOfThisYear = new Date(now.getFullYear(), 0, 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Coach statistics for current month
    const [
      totalCoaches,
      totalCoachesLastMonth,
      activeCoaches,
      activeCoachesLastMonth,
      blockedCoaches,
      blockedCoachesLastMonth,
    ] = await Promise.all([
      // Total coaches now
      this.prisma.coaches.count(),
      // Total coaches at end of last month
      this.prisma.coaches.count({
        where: { createdAt: { lte: endOfLastMonth } }
      }),
      // Active coaches now (logged in within 30 days)
      this.prisma.coaches.count({
        where: {
          isActive: true,
          lastLoginAt: { gte: thirtyDaysAgo }
        }
      }),
      // Active coaches last month (logged in within 30 days from end of last month)
      this.prisma.coaches.count({
        where: {
          isActive: true,
          lastLoginAt: {
            gte: new Date(endOfLastMonth.getTime() - (30 * 24 * 60 * 60 * 1000)),
            lte: endOfLastMonth
          },
          createdAt: { lte: endOfLastMonth }
        }
      }),
      // Blocked coaches now
      this.prisma.coaches.count({
        where: { isActive: false }
      }),
      // Blocked coaches last month
      this.prisma.coaches.count({
        where: {
          isActive: false,
          createdAt: { lte: endOfLastMonth }
        }
      }),
      // New coaches this month
      this.prisma.coaches.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      // New coaches last month
      this.prisma.coaches.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      })
    ]);

    // Calculate inactive coaches
    const inactiveCoaches = totalCoaches - activeCoaches - blockedCoaches;
    const inactiveCoachesLastMonth = totalCoachesLastMonth - activeCoachesLastMonth - blockedCoachesLastMonth;

    // Revenue statistics
    const [
      allTimeRevenue,
      lastYearRevenue,
      thisYearRevenue,
      monthlyRevenue,
      lastMonthRevenue
    ] = await Promise.all([
      // All time revenue
      this.prisma.transactions.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      }),
      // Last year's revenue
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
      // This year's revenue so far
      this.prisma.transactions.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: startOfThisYear }
        },
        _sum: { amount: true }
      }),
      // This month's revenue
      this.prisma.transactions.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),
      // Last month's revenue
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

    // Calculate growth percentages
    const totalCoachesGrowth = totalCoachesLastMonth > 0
      ? ((totalCoaches - totalCoachesLastMonth) / totalCoachesLastMonth) * 100
      : 0;

    const activeCoachesGrowth = activeCoachesLastMonth > 0
      ? ((activeCoaches - activeCoachesLastMonth) / activeCoachesLastMonth) * 100
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
      activeCoaches,
      activeCoachesGrowth: Math.round(activeCoachesGrowth * 100) / 100,
      inactiveCoaches,
      inactiveCoachesGrowth: Math.round(inactiveCoachesGrowth * 100) / 100,
      allTimeRevenue: Math.round((allTimeRevenue._sum.amount || 0) / 100),
      allTimeRevenueGrowth: Math.round(allTimeRevenueGrowth * 100) / 100,
      monthlyRevenue: Math.round((monthlyRevenue._sum.amount || 0) / 100),
      monthlyRevenueGrowth: Math.round(monthlyRevenueGrowth * 100) / 100,
    };
  }

  async getRevenueData(period: 'week' | 'month' | 'year'): Promise<RevenueGrowthData> {
    const now = new Date();
    let revenueData: RevenueData[] = [];
    let growthDescription = "";
    let growthPercentage = 0;

    if (period === 'week') {
      // Get daily revenue for last 7 days
      const dailyRevenue = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        const revenue = await this.prisma.transactions.aggregate({
          where: {
            status: 'completed',
            createdAt: {
              gte: startOfDay,
              lt: endOfDay
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

      // Calculate week-over-week growth
      const thisWeekTotal = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);

      // Get last week's total
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
      growthPercentage = lastWeekTotal > 0
        ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100
        : 0;

      const growthText = growthPercentage >= 0 ? "grown" : "decreased";
      growthDescription = `Your earnings has ${growthText} ${Math.abs(growthPercentage).toFixed(1)}% since last week`;

      revenueData = dailyRevenue;
    }

    else if (period === 'month') {
      // Get weekly revenue for current month
      const weeklyRevenue = [];
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
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

      // Calculate month-over-month growth
      const thisMonthTotal = weeklyRevenue.reduce((sum, week) => sum + week.revenue, 0);

      // Get last month's total
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

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
      growthPercentage = lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : 0;

      const growthText = growthPercentage >= 0 ? "grown" : "decreased";
      growthDescription = `Your earnings has ${growthText} ${Math.abs(growthPercentage).toFixed(1)}% since last month`;

      revenueData = weeklyRevenue;
    }

    else {
      // Get monthly revenue for current year
      const monthlyRevenue = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(now.getFullYear(), i, 1);
        const monthEnd = new Date(now.getFullYear(), i + 1, 1);

        const revenue = await this.prisma.transactions.aggregate({
          where: {
            status: 'completed',
            createdAt: {
              gte: monthStart,
              lt: monthEnd
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

      // Calculate year-over-year growth
      const thisYearTotal = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);

      // Get last year's total
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
      growthPercentage = lastYearTotal > 0
        ? ((thisYearTotal - lastYearTotal) / lastYearTotal) * 100
        : 0;

      const growthText = growthPercentage >= 0 ? "grown" : "decreased";
      growthDescription = `Your earnings has ${growthText} ${Math.abs(growthPercentage).toFixed(2)}% since last year`;

      revenueData = monthlyRevenue;
    }

    return {
      data: revenueData,
      growthDescription,
      growthPercentage: Math.round(growthPercentage * 100) / 100
    };
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
    const [stats, revenueDataYear, recentCoaches] = await Promise.all([
      this.getDashboardStats(),
      this.getRevenueData('year'),
      this.getRecentCoaches(6)
    ]);

    return {
      stats,
      revenueData: {
        yearly: revenueDataYear,
      },
      recentCoaches
    };
  }
}
