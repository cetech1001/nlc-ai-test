import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {v4 as uuid} from "uuid";
import {ConfigService} from "@nestjs/config";
import {
  CreateTransactionRequest,
  RefundRequest,
  TransactionFilters,
  ExtendedTransaction,
  UpdateTransactionRequest,
  BillingPaymentCompletedEvent,
  Paginated, UserType
} from "@nlc-ai/api-types";
import {PrismaService} from "@nlc-ai/api-database";
import {OutboxService} from "@nlc-ai/api-messaging";
import {Transaction, TransactionStatus} from "@prisma/client";

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly outboxService: OutboxService,
  ) {}

  async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    await this.validateUser(data.payerID, data.payerType);

    if (data.payeeID && data.payeeType && data.payeeType !== 'platform') {
      await this.validateUser(data.payeeID, data.payeeType);
    }

    await this.validatePaymentContext(data);

    if (data.paymentMethodID) {
      await this.validatePaymentMethod(data.paymentMethodID, data.payerID, data.payerType);
    }

    const invoiceNumber = this.generateInvoiceNumber();

    try {
      return this.prisma.transaction.create({
        data: {
          payerID: data.payerID,
          payerType: data.payerType,
          payeeID: data.payeeID,
          payeeType: data.payeeType,
          planID: data.planID,
          courseID: data.courseID,
          communityID: data.communityID,
          subscriptionID: data.subscriptionID,
          paymentRequestID: data.paymentRequestID,
          paymentMethodID: data.paymentMethodID,
          amount: data.amount,
          currency: data.currency || 'USD',
          status: TransactionStatus.pending,
          paymentMethodType: data.paymentMethodType,
          stripePaymentID: data.stripePaymentID,
          paypalOrderID: data.paypalOrderID,
          invoiceNumber,
          invoiceDate: data.invoiceDate || new Date(),
          dueDate: data.dueDate,
          description: data.description,
          metadata: data.metadata || {},
          platformFeeAmount: data.platformFeeAmount || 0,
          platformFeeRate: data.platformFeeRate || 0,
        },
        include: this.getTransactionIncludes(),
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to create transaction: ${error.message}`);
    }
  }

  async findAllTransactions(filters: TransactionFilters = {}): Promise<Paginated<ExtendedTransaction>> {
    const where: any = {};

    if (filters.payerID) where.payerID = filters.payerID;
    if (filters.payerType) where.payerType = filters.payerType;
    if (filters.payeeID) where.payeeID = filters.payeeID;
    if (filters.payeeType) where.payeeType = filters.payeeType;

    if (filters.planID) where.planID = filters.planID;
    if (filters.courseID) where.courseID = filters.courseID;
    if (filters.communityID) where.communityID = filters.communityID;
    if (filters.subscriptionID) where.subscriptionID = filters.subscriptionID;
    if (filters.paymentMethodID) where.paymentMethodID = filters.paymentMethodID;

    if (filters.status) where.status = filters.status;
    if (filters.paymentMethodType) where.paymentMethodType = filters.paymentMethodType;
    if (filters.currency) where.currency = filters.currency;

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
      include: this.getTransactionIncludes(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTransactionByID(id: string): Promise<ExtendedTransaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: this.getTransactionIncludes(),
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.mapTransactionWithDetails(transaction);
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
      status: TransactionStatus.completed,
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
        coachID: transaction.payerType === 'coach' ? transaction.payerID : transaction.payeeID || '',
        planID: transaction.planID || '',
        amount: transaction.amount,
        currency: transaction.currency,
        externalPaymentID: transaction.stripePaymentID || '',
        status: 'completed',
      },
    };

    await this.outboxService.saveAndPublishEvent(event, 'billing.payment.completed');
    return transaction;
  }

  async markTransactionFailed(id: string, failureReason: string): Promise<Transaction> {
    return this.updateTransaction(id, {
      status: TransactionStatus.failed,
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

  async getFailedTransactions(limit = 100): Promise<ExtendedTransaction[]> {
    const result = await this.findAllTransactions({ status: TransactionStatus.failed });
    return result.data.slice(0, limit);
  }

  async getPendingTransactions(olderThanMinutes = 60): Promise<ExtendedTransaction[]> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - olderThanMinutes);

    const result = await this.findAllTransactions({
      status: TransactionStatus.pending,
      dateRange: { start: new Date(0), end: cutoffTime },
    });

    return result.data;
  }

  async bulkExportTransactions(filters: any = {}) {
    const transactions = await this.prisma.transaction.findMany({
      where: filters,
      include: {
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

    return transactions.map((transaction: any) => ({
      transactionID: transaction.id,
      invoiceNumber: transaction.invoiceNumber,
      coachName: `${transaction.coach?.firstName} ${transaction.coach?.lastName}`,
      coachEmail: transaction.coach?.email,
      coachBusinessName: transaction.coach?.businessName,
      planName: transaction.plan?.name,
      planDescription: transaction.plan?.description,
      amount: (transaction.amount / 100), // Convert from cents
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      invoiceDate: transaction.invoiceDate.toISOString(),
      transactionDate: transaction.createdAt.toISOString(),
      paidAt: transaction.paidAt?.toISOString() || null,
      description: transaction.description,
      subscriptionID: transaction.subscription?.id,
      subscriptionStatus: transaction.subscription?.status,
      subscriptionBillingCycle: transaction.subscription?.billingCycle,
    }));
  }

  private async validateUser(userID: string, userType: UserType): Promise<void> {
    const table = userType === UserType.coach ? UserType.coach : UserType.client;

    let user;
    if (table === UserType.coach) {
      user = await this.prisma.coach.findUnique({
        where: { id: userID },
      });
    } else {
      user = await this.prisma.client.findUnique({
        where: { id: userID },
      });
    }

    if (!user) {
      throw new NotFoundException(`${userType} not found`);
    }
  }

  private async validatePaymentContext(data: CreateTransactionRequest): Promise<void> {
    if (data.planID) {
      const plan = await this.prisma.plan.findUnique({ where: { id: data.planID } });
      if (!plan) throw new NotFoundException('Plan not found');
    }

    if (data.courseID) {
      const course = await this.prisma.course.findUnique({ where: { id: data.courseID } });
      if (!course) throw new NotFoundException('Course not found');
    }

    if (data.communityID) {
      const community = await this.prisma.community.findUnique({ where: { id: data.communityID } });
      if (!community) throw new NotFoundException('Community not found');
    }

    if (data.subscriptionID) {
      const subscription = await this.prisma.subscription.findUnique({ where: { id: data.subscriptionID } });
      if (!subscription || subscription.subscriberID !== data.payerID) {
        throw new NotFoundException('Subscription not found or does not belong to payer');
      }
    }

    if (data.paymentRequestID) {
      const paymentRequest = await this.prisma.paymentRequest.findUnique({ where: { id: data.paymentRequestID } });
      if (!paymentRequest || paymentRequest.payerID !== data.payerID) {
        throw new NotFoundException('Payment request not found or does not belong to payer');
      }
    }
  }

  private async validatePaymentMethod(paymentMethodID: string, payerID: string, payerType: UserType): Promise<void> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: paymentMethodID },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    const belongsToPayer = payerType === 'coach'
      ? paymentMethod.coachID === payerID
      : paymentMethod.clientID === payerID;

    if (!belongsToPayer) {
      throw new NotFoundException('Payment method does not belong to payer');
    }

    if (!paymentMethod.isActive) {
      throw new BadRequestException('Payment method is not active');
    }
  }

  private getTransactionIncludes() {
    return {
      plan: { select: { name: true, monthlyPrice: true, annualPrice: true } },
      course: { select: { title: true, price: true } },
      community: { select: { name: true, pricingType: true } },
      subscription: { select: { status: true, billingCycle: true } },
      invoice: { select: { invoiceNumber: true, status: true } },
    };
  }

  private mapTransactionWithDetails(transaction: any): ExtendedTransaction {
    const getPayerDetails = () => {
      if (transaction.payerType === 'coach') {
        // Would need to fetch coach details separately or include in query
        return { id: transaction.payerID, type: 'coach', name: '', email: '' };
      } else {
        // Would need to fetch client details separately or include in query
        return { id: transaction.payerID, type: 'client', name: '', email: '' };
      }
    };

    return {
      ...transaction,
      payer: getPayerDetails(),
      payee: transaction.payeeID ? {
        id: transaction.payeeID,
        type: transaction.payeeType,
        name: '',
        email: ''
      } : undefined,
    };
  }

  private generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${timestamp}-${random}`;
  }
}
