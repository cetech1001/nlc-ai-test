import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {Invoice, InvoiceStatus, Prisma} from '@prisma/client';
import {
  CreateInvoiceRequest,
  InvoiceFilters,
  InvoiceWithDetails,
  UpdateInvoiceRequest
} from "@nlc-ai/api-types";

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    // Validate coach exists
    const coach = await this.prisma.coach.findUnique({
      where: { id: data.coachID },
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
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

    // Validate transaction if provided
    if (data.transactionID) {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: data.transactionID },
      });

      if (!transaction || transaction.coachID !== data.coachID) {
        throw new NotFoundException('Transaction not found or does not belong to coach');
      }
    }

    const invoiceNumber = this.generateInvoiceNumber();

    try {
      return this.prisma.invoice.create({
        data: {
          coachID: data.coachID,
          subscriptionID: data.subscriptionID,
          transactionID: data.transactionID,
          invoiceNumber,
          amount: data.amount,
          currency: data.currency || 'USD',
          status: InvoiceStatus.draft,
          issueDate: new Date(),
          dueDate: data.dueDate,
          lineItems: data.lineItems,
          subtotal: data.subtotal,
          taxRate: data.taxRate,
          taxAmount: data.taxAmount,
          discountAmount: data.discountAmount,
          total: data.total,
          notes: data.notes,
          metadata: data.metadata || {},
        },
        include: {
          coach: {
            select: {firstName: true, lastName: true, email: true, businessName: true},
          },
          subscription: {
            select: {
              status: true,
              billingCycle: true,
              plan: {select: {name: true}}
            },
          },
          transaction: {
            select: {status: true, stripePaymentID: true},
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('invoiceNumber')) {
        // Retry with a new invoice number
        return this.createInvoice(data);
      }
      throw new BadRequestException(`Failed to create invoice: ${error.message}`);
    }
  }

  async findAllInvoices(filters: InvoiceFilters = {}): Promise<InvoiceWithDetails[]> {
    const where: Prisma.InvoiceWhereInput = {};

    if (filters.coachID) {
      where.coachID = filters.coachID;
    }

    if (filters.subscriptionID) {
      where.subscriptionID = filters.subscriptionID;
    }

    if (filters.transactionID) {
      where.transactionID = filters.transactionID;
    }

    if (filters.status) {
      where.status = filters.status;
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
      where.issueDate = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    if (filters.dueDateRange) {
      where.dueDate = {
        gte: filters.dueDateRange.start,
        lte: filters.dueDateRange.end,
      };
    }

    if (filters.overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { not: InvoiceStatus.paid };
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true, businessName: true },
        },
        subscription: {
          select: {
            status: true,
            billingCycle: true,
            plan: { select: { name: true } }
          },
        },
        transaction: {
          select: { status: true, stripePaymentID: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findInvoiceById(id: string): Promise<InvoiceWithDetails> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true, businessName: true },
        },
        subscription: {
          select: {
            status: true,
            billingCycle: true,
            plan: { select: { name: true } }
          },
        },
        transaction: {
          select: { status: true, stripePaymentID: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async findInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithDetails> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true, businessName: true },
        },
        subscription: {
          select: {
            status: true,
            billingCycle: true,
            plan: { select: { name: true } }
          },
        },
        transaction: {
          select: { status: true, stripePaymentID: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateInvoice(id: string, data: UpdateInvoiceRequest): Promise<Invoice> {
    const existingInvoice = await this.findInvoiceById(id);

    // Prevent updates to paid invoices except for notes and metadata
    if (existingInvoice.status === InvoiceStatus.paid) {
      const allowedFields = ['notes', 'metadata'];
      const updateFields = Object.keys(data);
      const hasRestrictedFields = updateFields.some(field => !allowedFields.includes(field));

      if (hasRestrictedFields) {
        throw new BadRequestException('Paid invoices can only have notes and metadata updated');
      }
    }

    try {
      const updatedInvoice = await this.prisma.invoice.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return updatedInvoice;
    } catch (error: any) {
      throw new BadRequestException(`Failed to update invoice: ${error.message}`);
    }
  }

  async sendInvoice(id: string): Promise<Invoice> {
    const invoice = await this.findInvoiceById(id);

    if (invoice.status !== InvoiceStatus.draft) {
      throw new BadRequestException('Only draft invoices can be sent');
    }

    return this.updateInvoice(id, {
      status: InvoiceStatus.sent,
    });
  }

  async markInvoicePaid(id: string, paidAt?: Date): Promise<Invoice> {
    const invoice = await this.findInvoiceById(id);

    if (invoice.status === InvoiceStatus.paid) {
      throw new BadRequestException('Invoice is already paid');
    }

    if (invoice.status === InvoiceStatus.canceled) {
      throw new BadRequestException('Cannot mark canceled invoice as paid');
    }

    return this.updateInvoice(id, {
      status: InvoiceStatus.paid,
      paidAt: paidAt || new Date(),
    });
  }

  async markInvoiceOverdue(id: string): Promise<Invoice> {
    const invoice = await this.findInvoiceById(id);

    if (invoice.status === InvoiceStatus.paid) {
      throw new BadRequestException('Paid invoices cannot be marked as overdue');
    }

    if (invoice.dueDate > new Date()) {
      throw new BadRequestException('Invoice is not yet past due date');
    }

    return this.updateInvoice(id, {
      status: InvoiceStatus.overdue,
    });
  }

  async cancelInvoice(id: string): Promise<Invoice> {
    const invoice = await this.findInvoiceById(id);

    if (invoice.status === InvoiceStatus.paid) {
      throw new BadRequestException('Paid invoices cannot be canceled');
    }

    return this.updateInvoice(id, {
      status: InvoiceStatus.canceled,
    });
  }

  async refundInvoice(id: string): Promise<Invoice> {
    const invoice = await this.findInvoiceById(id);

    if (invoice.status !== InvoiceStatus.paid) {
      throw new BadRequestException('Only paid invoices can be refunded');
    }

    return this.updateInvoice(id, {
      status: InvoiceStatus.refunded,
    });
  }

  async getOverdueInvoices(daysOverdue = 0): Promise<InvoiceWithDetails[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

    return this.findAllInvoices({
      dueDateRange: { start: new Date(0), end: cutoffDate },
      overdue: true,
    });
  }

  async getDraftInvoices(coachID?: string): Promise<InvoiceWithDetails[]> {
    return this.findAllInvoices({
      coachID,
      status: InvoiceStatus.draft,
    });
  }

  async getInvoicesByCoach(coachID: string, limit = 50): Promise<InvoiceWithDetails[]> {
    return this.prisma.invoice.findMany({
      where: { coachID },
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true, businessName: true },
        },
        subscription: {
          select: {
            status: true,
            billingCycle: true,
            plan: { select: { name: true } }
          },
        },
        transaction: {
          select: { status: true, stripePaymentID: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getInvoiceStats(filters: {
    coachID?: string;
    dateRange?: { start: Date; end: Date };
  } = {}): Promise<{
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    overdueAmount: number;
    statusBreakdown: Record<InvoiceStatus, number>;
    paymentRate: number;
    averageInvoiceValue: number;
    overdueCount: number;
  }> {
    const where: Prisma.InvoiceWhereInput = {};

    if (filters.coachID) {
      where.coachID = filters.coachID;
    }

    if (filters.dateRange) {
      where.issueDate = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    const [
      totalStats,
      statusStats,
      paidStats,
      overdueStats,
    ] = await Promise.all([
      this.prisma.invoice.aggregate({
        where,
        _count: { id: true },
        _sum: { amount: true },
        _avg: { amount: true },
      }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: InvoiceStatus.paid },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          ...where,
          status: InvoiceStatus.overdue,
          dueDate: { lt: new Date() }
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const totalInvoices = totalStats._count.id;
    const paidInvoices = statusStats.find(s => s.status === InvoiceStatus.paid)?._count.id || 0;
    const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

    const statusBreakdown = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {} as Record<InvoiceStatus, number>);

    return {
      totalInvoices,
      totalAmount: totalStats._sum.amount || 0,
      paidAmount: paidStats._sum.amount || 0,
      overdueAmount: overdueStats._sum.amount || 0,
      statusBreakdown,
      paymentRate: Math.round(paymentRate * 100) / 100,
      averageInvoiceValue: totalStats._avg.amount || 0,
      overdueCount: overdueStats._count.id,
    };
  }

  async createInvoiceFromSubscription(subscriptionID: string, periodStart: Date, periodEnd: Date): Promise<Invoice> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionID },
      include: {
        coach: true,
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const amount = subscription.billingCycle === 'monthly'
      ? subscription.plan.monthlyPrice
      : subscription.plan.annualPrice;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days payment terms

    const lineItems: InvoiceLineItem[] = [
      {
        description: `${subscription.plan.name} Plan - ${subscription.billingCycle} billing`,
        quantity: 1,
        unitPrice: amount,
        amount,
        planID: subscription.planID,
        metadata: {
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          billingCycle: subscription.billingCycle,
        },
      },
    ];

    return this.createInvoice({
      coachID: subscription.coachID,
      subscriptionID,
      amount,
      dueDate,
      lineItems,
      subtotal: amount,
      total: amount,
      notes: `Invoice for ${subscription.plan.name} plan subscription`,
      metadata: {
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        autoGenerated: true,
      },
    });
  }

  private generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${timestamp}-${random}`;
  }

  async processOverdueInvoices(): Promise<{
    processed: number;
    errors: string[];
  }> {
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { in: [InvoiceStatus.sent] },
      },
    });

    let processed = 0;
    const errors: string[] = [];

    for (const invoice of overdueInvoices) {
      try {
        await this.markInvoiceOverdue(invoice.id);
        processed++;
      } catch (error: any) {
        errors.push(`Failed to mark invoice ${invoice.invoiceNumber} as overdue: ${error.message}`);
      }
    }

    return { processed, errors };
  }
}
