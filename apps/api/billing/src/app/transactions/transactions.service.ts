import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {PaymentMethodType, Prisma, Transaction, TransactionStatus} from '@prisma/client';
import {
  CreateTransactionRequest,
  RefundRequest,
  TransactionFilters,
  TransactionWithDetails,
  UpdateTransactionRequest,
  BillingPaymentCompletedEvent
} from "@nlc-ai/api-types";
import {PrismaService} from "@nlc-ai/api-database";
import {EventBusService} from "@nlc-ai/api-messaging";


@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    // Validate coach exists
    const coach = await this.prisma.coach.findUnique({
      where: { id: data.coachID },
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    // Validate plan exists
    const plan = await this.prisma.plan.findUnique({
      where: { id: data.planID },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Validate subscription if provided
    if (data.subscriptionID) {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: data.subscriptionID },
      });

      if (!subscription || subscription.coachID !== data.coachID) {
        throw new NotFoundException('Subscription not found or does not belong to coach');
      }
    }

    const invoiceNumber = this.generateInvoiceNumber();

    try {
      return this.prisma.transaction.create({
        data: {
          coachID: data.coachID,
          planID: data.planID,
          subscriptionID: data.subscriptionID,
          amount: data.amount,
          currency: data.currency || 'USD',
          status: TransactionStatus.pending,
          paymentMethod: data.paymentMethod,
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
        },
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to create transaction: ${error.message}`);
    }
  }

  async findAllTransactions(filters: TransactionFilters = {}): Promise<TransactionWithDetails[]> {
    const where: Prisma.TransactionWhereInput = {};

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

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
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

    return this.prisma.transaction.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTransactionById(id: string): Promise<TransactionWithDetails> {
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

  async findTransactionByInvoiceNumber(invoiceNumber: string): Promise<TransactionWithDetails> {
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
    await this.findTransactionById(id);

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
      status: TransactionStatus.completed,
      paidAt: paidAt || new Date(),
    });

    await this.eventBus.publish<BillingPaymentCompletedEvent>(
      'billing.payment.completed',
      {
        eventType: 'billing.payment.completed',
        schemaVersion: 1,
        payload: {
          transactionID: transaction.id,
          coachID: transaction.coachID,
          planID: transaction.planID,
          amount: transaction.amount,
          currency: transaction.currency,
          externalPaymentID: transaction.stripePaymentID || '',
          status: 'completed',
        },
      }
    );

    return transaction;
  }

  async markTransactionFailed(id: string, failureReason: string): Promise<Transaction> {
    return this.updateTransaction(id, {
      status: TransactionStatus.failed,
      failureReason,
    });
  }

  async processRefund(id: string, refundData: RefundRequest): Promise<Transaction> {
    const transaction = await this.findTransactionById(id);

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

  async getTransactionsByCoach(coachID: string, limit = 50): Promise<TransactionWithDetails[]> {
    return this.findAllTransactions({ coachID });
  }

  async getFailedTransactions(limit = 100): Promise<TransactionWithDetails[]> {
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

  async getPendingTransactions(olderThanMinutes = 60): Promise<TransactionWithDetails[]> {
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
        by: ['paymentMethod'],
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
      acc[stat.paymentMethod] = stat._count.id;
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
}
