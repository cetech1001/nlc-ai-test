import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {v4 as uuid} from "uuid";
import {ConfigService} from "@nestjs/config";
import {
  CreateTransactionRequest,
  RefundRequest,
  TransactionFilters,
  ExtendedTransaction,
  UpdateTransactionRequest,
  BillingPaymentCompletedEvent, Paginated
} from "@nlc-ai/api-types";
import {PrismaService} from "@nlc-ai/api-database";
import {OutboxService} from "@nlc-ai/api-messaging";
import {RevenueGrowthData, Transaction, TransactionStatus} from "@nlc-ai/types";


@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly outboxService: OutboxService,
  ) {}

  async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    const coach = await this.prisma.coach.findUnique({
      where: { id: data.coachID },
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: data.planID },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (data.subscriptionID) {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: data.subscriptionID },
      });

      if (!subscription || subscription.coachID !== data.coachID) {
        throw new NotFoundException('Subscription not found or does not belong to coach');
      }
    }

    if (data.paymentMethodID) {
      const paymentMethod = await this.prisma.paymentMethod.findUnique({
        where: { id: data.paymentMethodID },
      });

      if (!paymentMethod || paymentMethod.coachID !== data.coachID) {
        throw new NotFoundException('Payment method not found or does not belong to coach');
      }

      if (!paymentMethod.isActive) {
        throw new BadRequestException('Payment method is not active');
      }
    }

    const invoiceNumber = this.generateInvoiceNumber();

    try {
      return this.prisma.transaction.create({
        data: {
          coachID: data.coachID,
          planID: data.planID,
          subscriptionID: data.subscriptionID,
          paymentMethodID: data.paymentMethodID,
          amount: data.amount,
          currency: data.currency || 'USD',
          status: TransactionStatus.PENDING,
          paymentMethodType: data.paymentMethodType,
          stripePaymentID: data.stripePaymentID,
          paypalOrderID: data.paypalOrderID,
          invoiceNumber,
          invoiceDate: data.invoiceDate || new Date(),
          dueDate: data.dueDate,
          description: data.description,
          metadata: data.metadata || {},
        },
        include: {
          coach: {
            select: {firstName: true, lastName: true, email: true},
          },
          plan: {
            select: {name: true, monthlyPrice: true, annualPrice: true},
          },
          subscription: {
            select: {status: true, billingCycle: true},
          },
          paymentMethod: {
            select: {id: true}
          }
        },
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to create transaction: ${error.message}`);
    }
  }

  async findAllTransactions(filters: TransactionFilters = {}): Promise<Paginated<ExtendedTransaction>> {
    const where: any = {};

    if (filters.coachID) {
      where.coachID = filters.coachID;
    }

    if (filters.planID) {
      where.planID = filters.planID;
    }

    if (filters.subscriptionID) {
      where.subscriptionID = filters.subscriptionID;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentMethodType) {
      where.paymentMethodType = filters.paymentMethodType;
    }

    if (filters.paymentMethodID) {
      where.paymentMethodID = filters.paymentMethodID;
    }

    if (filters.currency) {
      where.currency = filters.currency;
    }

    if (filters.amountRange) {
      where.amount = {
        gte: filters.amountRange.min,
        lte: filters.amountRange.max,
      };
    }

    if (filters.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    return this.prisma.paginate(this.prisma.transaction, {
      where,
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true },
        },
        plan: {
          select: { name: true, monthlyPrice: true, annualPrice: true },
        },
        subscription: {
          select: { status: true, billingCycle: true },
        },
        paymentMethod: {
          select: {
            id: true,
            type: true,
            cardLast4: true,
            cardBrand: true,
            isDefault: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTransactionByID(id: string): Promise<ExtendedTransaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true },
        },
        plan: {
          select: { name: true, monthlyPrice: true, annualPrice: true },
        },
        subscription: {
          select: { status: true, billingCycle: true },
        },
        invoices: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async findTransactionByInvoiceNumber(invoiceNumber: string): Promise<ExtendedTransaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { invoiceNumber },
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true },
        },
        plan: {
          select: { name: true, monthlyPrice: true, annualPrice: true },
        },
        subscription: {
          select: { status: true, billingCycle: true },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async updateTransaction(id: string, data: UpdateTransactionRequest): Promise<Transaction> {
    await this.findTransactionByID(id);

    try {
      return this.prisma.transaction.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to update transaction: ${error.message}`);
    }
  }

  async markTransactionCompleted(id: string, paidAt?: Date): Promise<Transaction> {
    const transaction = await this.updateTransaction(id, {
      status: TransactionStatus.COMPLETED,
      paidAt: paidAt || new Date(),
    });

    const event: BillingPaymentCompletedEvent = {
      eventID: uuid(),
      eventType: 'billing.payment.completed',
      occurredAt: new Date().toISOString(),
      producer: this.configService.get<string>('billing.service.name', 'billing-service'),
      schemaVersion: 1,
      source: `${this.configService.get('billing.service.name')}.${this.configService.get('billing.service.environment')}`,
      payload: {
        transactionID: transaction.id,
        coachID: transaction.coachID,
        planID: transaction.planID,
        amount: transaction.amount,
        currency: transaction.currency,
        externalPaymentID: transaction.stripePaymentID || '',
        status: 'completed',
      },
    };

    // Save event to outbox (will be published asynchronously)
    await this.outboxService.saveAndPublishEvent(
      event,
      'billing.payment.completed'
    );

    return transaction;
  }

  async markTransactionFailed(id: string, failureReason: string): Promise<Transaction> {
    return this.updateTransaction(id, {
      status: TransactionStatus.FAILED,
      failureReason,
    });
  }

  async processRefund(id: string, refundData: RefundRequest): Promise<Transaction> {
    const transaction = await this.findTransactionByID(id);

    if (transaction.status !== TransactionStatus.completed) {
      throw new BadRequestException('Only completed transactions can be refunded');
    }

    if (transaction.refundedAmount && transaction.refundedAmount >= transaction.amount) {
      throw new BadRequestException('Transaction is already fully refunded');
    }

    const refundAmount = refundData.amount || transaction.amount;
    const existingRefunds = transaction.refundedAmount || 0;
    const totalRefundAmount = existingRefunds + refundAmount;

    if (totalRefundAmount > transaction.amount) {
      throw new BadRequestException('Refund amount exceeds transaction amount');
    }

    const isFullRefund = totalRefundAmount === transaction.amount;
    const newStatus = isFullRefund ? TransactionStatus.refunded : TransactionStatus.partially_refunded;

    return this.updateTransaction(id, {
      status: newStatus,
      refundedAmount: totalRefundAmount,
      refundReason: refundData.reason,
    });
  }

  async getTransactionsByCoach(coachID: string, limit = 50): Promise<ExtendedTransaction[]> {
    return this.findAllTransactions({ coachID });
  }

  async getFailedTransactions(limit = 100): Promise<ExtendedTransaction[]> {
    return this.prisma.transaction.findMany({
      where: { status: TransactionStatus.failed },
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true },
        },
        plan: {
          select: { name: true, monthlyPrice: true, annualPrice: true },
        },
        subscription: {
          select: { status: true, billingCycle: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getPendingTransactions(olderThanMinutes = 60): Promise<ExtendedTransaction[]> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - olderThanMinutes);

    return this.prisma.transaction.findMany({
      where: {
        status: TransactionStatus.pending,
        createdAt: { lte: cutoffTime },
      },
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true },
        },
        plan: {
          select: { name: true, monthlyPrice: true, annualPrice: true },
        },
        subscription: {
          select: { status: true, billingCycle: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
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

  private async getWeeklyRevenueData(): Promise<RevenueGrowthData> {
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

  private async getYearlyRevenueData(): Promise<RevenueGrowthData> {
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
    }
  }

  async getRevenueByPeriod(period: 'week' | 'month' | 'year' = 'month') {
    switch (period) {
      case 'week':
        return this.getWeeklyRevenueData();
      case 'month':
        return this.getMonthlyRevenueData();
      case 'year':
      default:
        return this.getYearlyRevenueData();
    }
  }

  async getTransactionStats(filters: {
    coachID?: string;
    dateRange?: { start: Date; end: Date }
  } = {}): Promise<{
    totalTransactions: number;
    totalRevenue: number;
    totalRefunds: number;
    successRate: number;
    averageTransactionValue: number;
    statusBreakdown: Record<TransactionStatus, number>;
    paymentMethodBreakdown: Record<PaymentMethodType, number>;
    monthlyRevenue?: { month: string; revenue: number; count: number }[];
  }> {
    const where: Prisma.TransactionWhereInput = {};

    if (filters.coachID) {
      where.coachID = filters.coachID;
    }

    if (filters.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    const [
      totalStats,
      statusStats,
      paymentMethodStats,
      monthlyStats,
    ] = await Promise.all([
      this.prisma.transaction.aggregate({
        where,
        _count: { id: true },
        _sum: { amount: true, refundedAmount: true },
        _avg: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['paymentMethodType'],
        where,
        _count: { id: true },
      }),
      filters.dateRange ? this.prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', "createdAt") as month,
          SUM(amount) as revenue,
          COUNT(*) as count
        FROM transactions
        WHERE "createdAt" >= ${filters.dateRange.start}
          AND "createdAt" <= ${filters.dateRange.end}
          AND status = 'completed'
          ${filters.coachID ? Prisma.sql`AND "coachID" = ${filters.coachID}` : Prisma.empty}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month
      ` : null,
    ]);

    const totalTransactions = totalStats._count.id;
    const completedTransactions = statusStats.find(s => s.status === TransactionStatus.completed)?._count.id || 0;
    const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;

    const statusBreakdown = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {} as Record<TransactionStatus, number>);

    const paymentMethodBreakdown = paymentMethodStats.reduce((acc, stat) => {
      acc[stat.paymentMethodType] = stat._count.id;
      return acc;
    }, {} as Record<PaymentMethodType, number>);

    const monthlyRevenue = monthlyStats ? (monthlyStats as any[]).map(stat => ({
      month: stat.month.toISOString().substring(0, 7), // YYYY-MM format
      revenue: Number(stat.revenue),
      count: Number(stat.count),
    })) : undefined;

    return {
      totalTransactions,
      totalRevenue: totalStats._sum.amount || 0,
      totalRefunds: totalStats._sum.refundedAmount || 0,
      successRate: Math.round(successRate * 100) / 100,
      averageTransactionValue: totalStats._avg.amount || 0,
      statusBreakdown,
      paymentMethodBreakdown,
      monthlyRevenue,
    };
  }

  private generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${timestamp}-${random}`;
  }

  async getRevenueReport(filters: {
    coachID?: string;
    dateRange: { start: Date; end: Date };
    groupBy: 'day' | 'week' | 'month' | 'year';
  }): Promise<{
    period: string;
    revenue: number;
    transactionCount: number;
    averageOrderValue: number;
  }[]> {
    const { coachID, dateRange, groupBy } = filters;

    const truncFunction = {
      day: 'day',
      week: 'week',
      month: 'month',
      year: 'year',
    }[groupBy];

    const results = await this.prisma.$queryRaw`
      SELECT
        DATE_TRUNC(${truncFunction}, "createdAt") as period,
        SUM(amount) as revenue,
        COUNT(*) as "transactionCount",
        AVG(amount) as "averageOrderValue"
      FROM transactions
      WHERE "createdAt" >= ${dateRange.start}
        AND "createdAt" <= ${dateRange.end}
        AND status = 'completed'
        ${coachID ? Prisma.sql`AND "coachID" = ${coachID}` : Prisma.empty}
      GROUP BY DATE_TRUNC(${truncFunction}, "createdAt")
      ORDER BY period
    ` as any[];

    return results.map(result => ({
      period: result.period.toISOString().split('T')[0],
      revenue: Number(result.revenue),
      transactionCount: Number(result.transactionCount),
      averageOrderValue: Number(result.averageOrderValue),
    }));
  }

  async getTransactionsByPaymentMethod(paymentMethodID: string, limit = 50): Promise<ExtendedTransaction[]> {
    return this.findAllTransactions({ paymentMethodID });
  }
}
