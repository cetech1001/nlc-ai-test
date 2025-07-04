import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DashboardStats {
  totalCoaches: number;
  activeCoaches: number;
  inactiveCoaches: number;
  allTimeRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  coachGrowth: number;
}

export interface RevenueData {
  period: string;
  revenue: number;
  date?: string;
}

export interface RecentCoach {
  id: string;
  name: string;
  email: string;
  dateJoined: string;
  plan: string;
  status: string;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get coach statistics
    const [totalCoaches, activeCoaches, coachesThisMonth, coachesLastMonth] = await Promise.all([
      this.prisma.coaches.count(),
      this.prisma.coaches.count({
        where: { isActive: true }
      }),
      this.prisma.coaches.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),
      this.prisma.coaches.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      })
    ]);

    const inactiveCoaches = totalCoaches - activeCoaches;

    const [allTimeRevenue, monthlyRevenue, lastMonthRevenue] = await Promise.all([
      this.prisma.transactions.aggregate({
        where: { status: 'completed' },
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
      }),
      this.prisma.transactions.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: startOfYear }
        },
        _sum: { amount: true }
      })
    ]);

    const revenueGrowth = lastMonthRevenue._sum.amount
      ? ((monthlyRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0)) / (lastMonthRevenue._sum.amount || 1) * 100
      : 0;

    const coachGrowth = coachesLastMonth
      ? ((coachesThisMonth - coachesLastMonth) / coachesLastMonth) * 100
      : 0;

    return {
      totalCoaches,
      activeCoaches,
      inactiveCoaches,
      allTimeRevenue: Math.round((allTimeRevenue._sum.amount || 0) / 100), // Convert from cents
      monthlyRevenue: Math.round((monthlyRevenue._sum.amount || 0) / 100), // Convert from cents
      revenueGrowth: Math.round(revenueGrowth * 100) / 100, // Round to 2 decimal places
      coachGrowth: Math.round(coachGrowth * 100) / 100, // Round to 2 decimal places
    };
  }

  async getRevenueData(period: 'week' | 'month' | 'year'): Promise<RevenueData[]> {
    const now = new Date();

    if (period === 'week') {
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
      return dailyRevenue;
    }

    if (period === 'month') {
      const weeklyRevenue = [];
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      let weekStart = new Date(startOfMonth);
      let weekNumber = 1;

      while (weekStart.getMonth() === now.getMonth()) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        if (weekEnd.getMonth() > now.getMonth()) {
          weekEnd.setDate(0); // Last day of current month
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
      return weeklyRevenue;
    }

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

    return monthlyRevenue;
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

    return coaches.map(coach => ({
      id: coach.id,
      name: `${coach.firstName} ${coach.lastName}`,
      email: coach.email,
      dateJoined: coach.createdAt?.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) || '',
      plan: coach.subscriptions[0]?.plan?.name || 'No Plan',
      status: coach.isActive ? 'active' : 'inactive'
    }));
  }

  async getDashboardData() {
    const [stats, revenueDataYear, recentCoaches] = await Promise.all([
      this.getDashboardStats(),
      this.getRevenueData('year'),
      this.getRecentCoaches(6)
    ]);

    const [revenueDataWeek, revenueDataMonth] = await Promise.all([
      this.getRevenueData('week'),
      this.getRevenueData('month')
    ]);

    return {
      stats,
      revenueData: {
        weekly: revenueDataWeek,
        monthly: revenueDataMonth,
        yearly: revenueDataYear
      },
      recentCoaches
    };
  }
}
