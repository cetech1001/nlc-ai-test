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
    endDate?: string
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
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

  // Method to download transaction data (returns data for CSV export)
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
    };
  }
}
