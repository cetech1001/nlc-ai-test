import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import PDFDocument from 'pdfkit';
import {Invoice, InvoiceStatus, Prisma} from '@prisma/client';
import {
  CreateInvoiceRequest,
  InvoiceFilters, InvoiceLineItem,
  ExtendedInvoice,
  UpdateInvoiceRequest
} from "@nlc-ai/api-types";
import {PrismaService} from "@nlc-ai/api-database";
import {TransactionsService} from "../transactions/transactions.service";

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private transactionService: TransactionsService,
  ) {}

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
          lineItems: JSON.stringify(data.lineItems),
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

  async findAllInvoices(filters: InvoiceFilters = {}): Promise<ExtendedInvoice[]> {
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

  async findInvoiceById(id: string): Promise<ExtendedInvoice> {
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

  async findInvoiceByNumber(invoiceNumber: string): Promise<ExtendedInvoice> {
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
      return this.prisma.invoice.update({
        where: { id },
        data: {
          ...data,
          lineItems: data.lineItems ? JSON.stringify(data.lineItems) : undefined,
          updatedAt: new Date(),
        },
      });
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

  async getOverdueInvoices(daysOverdue = 0): Promise<ExtendedInvoice[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

    return this.findAllInvoices({
      dueDateRange: { start: new Date(0), end: cutoffDate },
      overdue: true,
    });
  }

  async getDraftInvoices(coachID?: string): Promise<ExtendedInvoice[]> {
    return this.findAllInvoices({
      coachID,
      status: InvoiceStatus.draft,
    });
  }

  async getInvoicesByCoach(coachID: string, limit = 50): Promise<ExtendedInvoice[]> {
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

  async generateInvoicePDF(transactionID: string): Promise<Buffer> {
    const transaction = await this.transactionService.findTransactionByID(transactionID);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4'
        });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        doc.fontSize(20)
          .fillColor('#7B21BA')
          .text('NLC AI PLATFORM', 50, 50);

        doc.fontSize(10)
          .fillColor('#666666')
          .text('AI-Powered Coaching Solutions', 50, 75)
          .text('support@nextlevelcoach.ai', 50, 90)
          .text('nextlevelcoach.ai', 50, 105);

        doc.fontSize(24)
          .fillColor('#000000')
          .text('INVOICE', 400, 50);

        doc.fontSize(12)
          .text(`Invoice #: ${transaction.invoiceNumber || transaction.id.slice(0, 8).toUpperCase()}`, 400, 80)
          .text(`Date: ${new Date(transaction.invoiceDate).toLocaleDateString()}`, 400, 100)
          .text(`Due Date: ${transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString() : 'N/A'}`, 400, 120)
          .text(`Status: ${transaction.status.toUpperCase()}`, 400, 140);

        doc.fontSize(14)
          .fillColor('#7B21BA')
          .text('BILL TO:', 50, 180);

        doc.fontSize(11)
          .fillColor('#000000')
          .text(transaction.coachName, 50, 205)
          .text(transaction.coach.email, 50, 220);

        if (transaction.coach.businessName) {
          doc.text(transaction.coach.businessName, 50, 235);
        }

        doc.strokeColor('#cccccc')
          .lineWidth(1)
          .moveTo(50, 280)
          .lineTo(550, 280)
          .stroke();

        const tableTop = 300;
        const itemCodeX = 50;
        const descriptionX = 150;
        const quantityX = 350;
        const priceX = 400;
        const amountX = 480;

        doc.fontSize(12)
          .fillColor('#7B21BA')
          .text('Item', itemCodeX, tableTop)
          .text('Description', descriptionX, tableTop)
          .text('Qty', quantityX, tableTop)
          .text('Price', priceX, tableTop)
          .text('Amount', amountX, tableTop);

        doc.strokeColor('#cccccc')
          .lineWidth(1)
          .moveTo(50, tableTop + 20)
          .lineTo(550, tableTop + 20)
          .stroke();

        const itemY = tableTop + 35;
        doc.fontSize(10)
          .fillColor('#000000')
          .text('PLAN-001', itemCodeX, itemY)
          .text(transaction.plan.name || 'Subscription Plan', descriptionX, itemY)
          .text('1', quantityX, itemY)
          .text(`$${(transaction.amount / 100).toFixed(2)}`, priceX, itemY)
          .text(`$${(transaction.amount / 100).toFixed(2)}`, amountX, itemY);

        let nextY = itemY + 15;
        if (transaction.plan.description) {
          doc.fontSize(8)
            .fillColor('#666666')
            .text(transaction.plan.description, descriptionX, nextY, { width: 180 });
          nextY += 25;
        } else {
          nextY += 10;
        }

        const subtotalY = nextY + 30;
        const totalX = 450;

        doc.fontSize(11)
          .fillColor('#000000')
          .text('Subtotal:', 400, subtotalY)
          .text(`$${(transaction.amount / 100).toFixed(2)}`, totalX, subtotalY);

        const taxY = subtotalY + 20;
        doc.text('Tax (0%):', 400, taxY)
          .text('$0.00', totalX, taxY);

        doc.strokeColor('#7B21BA')
          .lineWidth(2)
          .moveTo(400, taxY + 25)
          .lineTo(550, taxY + 25)
          .stroke();

        const totalY = taxY + 35;
        doc.fontSize(14)
          .fillColor('#7B21BA')
          .text('TOTAL:', 400, totalY)
          .text(`$${(transaction.amount / 100).toFixed(2)}`, totalX, totalY);

        const paymentY = totalY + 50;
        doc.fontSize(12)
          .fillColor('#7B21BA')
          .text('PAYMENT INFORMATION:', 50, paymentY);

        let paymentInfoY = paymentY + 20;
        doc.fontSize(10)
          .fillColor('#000000')
          .text(`Payment Method: ${transaction.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`, 50, paymentInfoY);

        if (transaction.paidAt) {
          paymentInfoY += 15;
          doc.text(`Paid On: ${new Date(transaction.paidAt).toLocaleDateString()}`, 50, paymentInfoY);
        }

        if (transaction.stripePaymentID) {
          paymentInfoY += 15;
          doc.text(`Transaction ID: ${transaction.stripePaymentID}`, 50, paymentInfoY);
        }

        const footerY = Math.max(paymentInfoY + 40, 650);
        doc.fontSize(8)
          .fillColor('#666666')
          .text('Thank you for choosing NLC AI Platform for your coaching needs.', 50, footerY)
          .text('For support, please contact us at support@nextlevelcoach.ai', 50, footerY + 12)
          .text('This invoice was generated automatically by the NLC AI Platform.', 50, footerY + 24);

        if (transaction.status !== 'completed') {
          doc.fontSize(60)
            .fillColor('#ff0000', 0.1)
            .rotate(-45, { origin: [300, 400] })
            .text('UNPAID', 150, 350)
            .rotate(45, { origin: [300, 400] });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
