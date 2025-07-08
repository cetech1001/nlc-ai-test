import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TransactionWithDetails {
  id: string;
  coachId: string;
  coachName: string;
  coachEmail: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  invoiceNumber?: string;
  invoiceDate: Date;
  transactionDate: Date;
  paidAt?: Date;
  description?: string;
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 10,
    status?: string,
    search?: string,
    startDate?: string,
    endDate?: string,
    paymentMethod?: string,
    minAmount?: string,
    maxAmount?: string,
    planNames?: string
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Status filter
    if (status) {
      where.status = status;
    }

    // Payment method filter
    if (paymentMethod) {
      const methods = paymentMethod.split(',').map(m => m.trim());
      where.paymentMethod = { in: methods };
    }

    // Plan names filter
    if (planNames) {
      const names = planNames.split(',').map(n => n.trim());
      where.plan = {
        name: { in: names }
      };
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) {
        where.amount.gte = parseFloat(minAmount) * 100; // Convert to cents
      }
      if (maxAmount) {
        where.amount.lte = parseFloat(maxAmount) * 100; // Convert to cents
      }
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        where.createdAt.lte = end;
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { coach: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          }},
        { plan: { name: { contains: search, mode: 'insensitive' } }},
      ];
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transactions.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          coach: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          plan: {
            select: {
              name: true,
            }
          }
        }
      }),
      this.prisma.transactions.count({ where })
    ]);

    const transactionsWithDetails: TransactionWithDetails[] = transactions.map(transaction => ({
      id: transaction.id,
      coachId: transaction.coachId,
      coachName: `${transaction.coach.firstName} ${transaction.coach.lastName}`,
      coachEmail: transaction.coach.email,
      planName: transaction.plan.name,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      invoiceNumber: transaction.invoiceNumber,
      invoiceDate: transaction.invoiceDate,
      transactionDate: transaction.createdAt,
      paidAt: transaction.paidAt,
      description: transaction.description,
    }));

    return {
      data: transactionsWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transactions.findUnique({
      where: { id },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            businessName: true,
          }
        },
        plan: {
          select: {
            name: true,
            description: true,
          }
        },
        subscription: {
          select: {
            id: true,
            status: true,
            billingCycle: true,
          }
        }
      }
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return {
      ...transaction,
      coachName: `${transaction.coach.firstName} ${transaction.coach.lastName}`,
    };
  }

  async getTransactionStats() {
    const [totalTransactions, completedTransactions, pendingTransactions, failedTransactions, totalRevenue] = await Promise.all([
      this.prisma.transactions.count(),
      this.prisma.transactions.count({ where: { status: 'completed' } }),
      this.prisma.transactions.count({ where: { status: 'pending' } }),
      this.prisma.transactions.count({ where: { status: 'failed' } }),
      this.prisma.transactions.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      })
    ]);

    return {
      total: totalTransactions,
      completed: completedTransactions,
      pending: pendingTransactions,
      failed: failedTransactions,
      totalRevenue: Math.round((totalRevenue._sum.amount || 0) / 100), // Convert from cents
    };
  }

  async getRevenueByPeriod(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const transactions = await this.prisma.transactions.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: startDate }
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group transactions by period
    const revenueData = transactions.reduce((acc, transaction) => {
      const date = transaction.createdAt;
      let key: string;

      if (period === 'week') {
        key = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (period === 'month') {
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        key = `Week ${weekOfMonth}`;
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short' });
      }

      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += transaction.amount;

      return acc;
    }, {} as Record<string, number>);

    return Object.entries(revenueData).map(([period, amount]) => ({
      period,
      revenue: Math.round(amount / 100), // Convert from cents
    }));
  }

  async getTransactionExport(transactionId: string) {
    const transaction = await this.findOne(transactionId);

    return {
      transactionId: transaction.id,
      invoiceNumber: transaction.invoiceNumber,
      coachName: transaction.coachName,
      coachEmail: transaction.coach.email,
      planName: transaction.plan.name,
      amount: (transaction.amount / 100), // Convert from cents
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      transactionDate: transaction.createdAt.toISOString(),
      paidAt: transaction.paidAt?.toISOString() || null,
      coach: {
        id: transaction.coach.id,
        firstName: transaction.coach.firstName,
        lastName: transaction.coach.lastName,
        email: transaction.coach.email,
        businessName: transaction.coach.businessName,
      },
      plan: {
        name: transaction.plan.name,
        description: transaction.plan.description,
      },
      subscription: transaction.subscription ? {
        id: transaction.subscription.id,
        status: transaction.subscription.status,
        billingCycle: transaction.subscription.billingCycle,
      } : null,
      exportedAt: new Date().toISOString(),
      exportedBy: 'admin',
    };
  }

  async bulkExportTransactions(filters: any = {}) {
    const transactions = await this.prisma.transactions.findMany({
      where: filters,
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            businessName: true,
          }
        },
        plan: {
          select: {
            name: true,
            description: true,
          }
        },
        subscription: {
          select: {
            id: true,
            status: true,
            billingCycle: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return transactions.map(transaction => ({
      transactionId: transaction.id,
      invoiceNumber: transaction.invoiceNumber,
      coachName: `${transaction.coach.firstName} ${transaction.coach.lastName}`,
      coachEmail: transaction.coach.email,
      coachBusinessName: transaction.coach.businessName,
      planName: transaction.plan.name,
      planDescription: transaction.plan.description,
      amount: (transaction.amount / 100), // Convert from cents
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      invoiceDate: transaction.invoiceDate.toISOString(),
      transactionDate: transaction.createdAt.toISOString(),
      paidAt: transaction.paidAt?.toISOString() || null,
      description: transaction.description,
      subscriptionId: transaction.subscription?.id,
      subscriptionStatus: transaction.subscription?.status,
      subscriptionBillingCycle: transaction.subscription?.billingCycle,
    }));
  }

  async getTransactionsByStatus(status: string) {
    return this.prisma.transactions.findMany({
      where: { status },
      include: {
        coach: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        plan: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date) {
    return this.prisma.transactions.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: {
        coach: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        plan: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTopPayingCoaches(limit = 10) {
    const result = await this.prisma.transactions.groupBy({
      by: ['coachId'],
      where: {
        status: 'completed'
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: limit,
    });

    // Get coach details for the top paying coaches
    const coachIds = result.map(r => r.coachId);
    const coaches = await this.prisma.coaches.findMany({
      where: {
        id: {
          in: coachIds,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return result.map(r => {
      const coach = coaches.find(c => c.id === r.coachId);
      return {
        coachId: r.coachId,
        coachName: coach ? `${coach.firstName} ${coach.lastName}` : 'Unknown',
        coachEmail: coach?.email || 'Unknown',
        totalAmount: Math.round((r._sum.amount || 0) / 100), // Convert from cents
        transactionCount: r._count.id,
      };
    });
  }

  async getMonthlyRevenueComparison() {
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    const [currentMonthRevenue, previousMonthRevenue] = await Promise.all([
      this.prisma.transactions.aggregate({
        where: {
          status: 'completed',
          createdAt: {
            gte: currentMonth,
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.transactions.aggregate({
        where: {
          status: 'completed',
          createdAt: {
            gte: previousMonth,
            lte: previousMonthEnd,
          },
        },
        _sum: { amount: true },
      }),
    ]);

    const current = Math.round((currentMonthRevenue._sum.amount || 0) / 100);
    const previous = Math.round((previousMonthRevenue._sum.amount || 0) / 100);
    const percentageChange = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return {
      currentMonth: current,
      previousMonth: previous,
      percentageChange: Math.round(percentageChange * 100) / 100,
      trend: current > previous ? 'up' : current < previous ? 'down' : 'stable',
    };
  }

  async updateTransactionStatus(id: string, status: string) {
    const transaction = await this.prisma.transactions.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const updatedTransaction = await this.prisma.transactions.update({
      where: { id },
      data: {
        status,
        paidAt: status === 'completed' ? new Date() : transaction.paidAt,
      },
      include: {
        coach: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        plan: {
          select: {
            name: true,
          }
        }
      }
    });

    return {
      ...updatedTransaction,
      coachName: `${updatedTransaction.coach.firstName} ${updatedTransaction.coach.lastName}`,
    };
  }

  async getTransactionTrends(period: 'daily' | 'weekly' | 'monthly' = 'daily', days = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    const transactions = await this.prisma.transactions.findMany({
      where: {
        status: 'completed',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group transactions by period
    const trends = transactions.reduce((acc, transaction) => {
      const date = transaction.createdAt;
      let key: string;

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!acc[key]) {
        acc[key] = { revenue: 0, count: 0 };
      }
      acc[key].revenue += transaction.amount;
      acc[key].count += 1;

      return acc;
    }, {} as Record<string, { revenue: number; count: number }>);

    return Object.entries(trends).map(([period, data]) => ({
      period,
      revenue: Math.round(data.revenue / 100), // Convert from cents
      transactionCount: data.count,
    })).sort((a, b) => a.period.localeCompare(b.period));
  }

  async getPaymentMethodBreakdown() {
    const result = await this.prisma.transactions.groupBy({
      by: ['paymentMethod'],
      where: {
        status: 'completed'
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalRevenue = result.reduce((sum, r) => sum + (r._sum.amount || 0), 0);

    return result.map(r => ({
      paymentMethod: r.paymentMethod,
      totalAmount: Math.round((r._sum.amount || 0) / 100), // Convert from cents
      transactionCount: r._count.id,
      percentage: totalRevenue > 0 ? Math.round(((r._sum.amount || 0) / totalRevenue) * 100 * 100) / 100 : 0,
    })).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  async refundTransaction(id: string, reason?: string) {
    const transaction = await this.prisma.transactions.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (transaction.status !== 'completed') {
      throw new Error('Only completed transactions can be refunded');
    }

    return this.prisma.transactions.update({
      where: { id },
      data: {
        status: 'refunded',
        description: reason ? `${transaction.description || ''} - Refunded: ${reason}` : transaction.description,
      },
      include: {
        coach: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        plan: {
          select: {
            name: true,
          }
        }
      }
    });
  }
}
