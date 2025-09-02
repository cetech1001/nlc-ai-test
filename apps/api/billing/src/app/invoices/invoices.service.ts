// apps/api/billing/src/app/invoices/invoices.service.ts
import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import PDFDocument from 'pdfkit';
import {Invoice, InvoiceStatus, Prisma} from '@prisma/client';
import {
  CreateInvoiceRequest,
  InvoiceFilters,
  InvoiceLineItem,
  ExtendedInvoice,
  UpdateInvoiceRequest, UserType
} from "@nlc-ai/api-types";
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    // Validate customer exists
    await this.validateUser(data.customerID, data.customerType);

    // Validate subscription if provided
    if (data.subscriptionID) {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: data.subscriptionID },
      });

      if (!subscription || subscription.subscriberID !== data.customerID) {
        throw new NotFoundException('Subscription not found or does not belong to customer');
      }
    }

    // Validate transaction if provided
    if (data.transactionID) {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: data.transactionID },
      });

      if (!transaction || transaction.payerID !== data.customerID) {
        throw new NotFoundException('Transaction not found or does not belong to customer');
      }
    }

    const invoiceNumber = this.generateInvoiceNumber();

    try {
      return this.prisma.invoice.create({
        data: {
          customerID: data.customerID,
          customerType: data.customerType,
          subscriptionID: data.subscriptionID,
          // transactionID: data.transactionID,
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

    if (filters.customerID) where.customerID = filters.customerID;
    if (filters.customerType) where.customerType = filters.customerType;
    if (filters.subscriptionID) where.subscriptionID = filters.subscriptionID;
    // if (filters.transactionID) where.transactionID = filters.transactionID;
    if (filters.status) where.status = filters.status;
    if (filters.currency) where.currency = filters.currency;

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

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: this.getInvoiceIncludes(),
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map(invoice => this.mapInvoiceWithDetails(invoice));
  }

  async findInvoiceByID(id: string): Promise<ExtendedInvoice> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: this.getInvoiceIncludes(),
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.mapInvoiceWithDetails(invoice);
  }

  async findInvoiceByNumber(invoiceNumber: string): Promise<ExtendedInvoice> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: this.getInvoiceIncludes(),
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.mapInvoiceWithDetails(invoice);
  }

  async updateInvoice(id: string, data: UpdateInvoiceRequest): Promise<Invoice> {
    const existingInvoice = await this.findInvoiceByID(id);

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
    const invoice = await this.findInvoiceByID(id);

    if (invoice.status !== InvoiceStatus.draft) {
      throw new BadRequestException('Only draft invoices can be sent');
    }

    return this.updateInvoice(id, {
      status: InvoiceStatus.sent,
    });
  }

  async markInvoicePaid(id: string, paidAt?: Date): Promise<Invoice> {
    const invoice = await this.findInvoiceByID(id);

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
    const invoice = await this.findInvoiceByID(id);

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
    const invoice = await this.findInvoiceByID(id);

    if (invoice.status === InvoiceStatus.paid) {
      throw new BadRequestException('Paid invoices cannot be canceled');
    }

    return this.updateInvoice(id, {
      status: InvoiceStatus.canceled,
    });
  }

  async refundInvoice(id: string): Promise<Invoice> {
    const invoice = await this.findInvoiceByID(id);

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

  async getDraftInvoices(customerID?: string, customerType?: UserType): Promise<ExtendedInvoice[]> {
    return this.findAllInvoices({
      customerID,
      customerType,
      status: InvoiceStatus.draft,
    });
  }

  async getInvoicesByCustomer(customerID: string, customerType: UserType, limit = 50): Promise<ExtendedInvoice[]> {
    const result = await this.findAllInvoices({ customerID, customerType });
    return result.slice(0, limit);
  }

  async createInvoiceFromSubscription(subscriptionID: string, periodStart: Date, periodEnd: Date): Promise<Invoice> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionID },
      include: {
        plan: true,
        community: true,
        course: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days payment terms

    let lineItems: InvoiceLineItem[] = [];
    let resourceName = '';

    if (subscription.plan) {
      const amount = subscription.billingCycle === 'monthly'
        ? subscription.plan.monthlyPrice
        : subscription.plan.annualPrice;

      resourceName = subscription.plan.name;
      lineItems = [{
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
      }];
    } else if (subscription.community) {
      const amount = subscription.billingCycle === 'monthly'
        ? subscription.community.monthlyPrice || 0
        : subscription.community.annualPrice || 0;

      resourceName = subscription.community.name;
      lineItems = [{
        description: `${subscription.community.name} Community - ${subscription.billingCycle} access`,
        quantity: 1,
        unitPrice: amount,
        amount,
        metadata: {
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          billingCycle: subscription.billingCycle,
        },
      }];
    } else if (subscription.course) {
      const amount = subscription.billingCycle === 'monthly'
        ? subscription.course.monthlyPrice || 0
        : subscription.course.annualPrice || 0;

      resourceName = subscription.course.title;
      lineItems = [{
        description: `${subscription.course.title} Course - ${subscription.billingCycle} access`,
        quantity: 1,
        unitPrice: amount,
        amount,
        metadata: {
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          billingCycle: subscription.billingCycle,
        },
      }];
    }

    const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

    return this.createInvoice({
      customerID: subscription.subscriberID,
      customerType: subscription.subscriberType as UserType,
      subscriptionID,
      amount: totalAmount,
      dueDate,
      lineItems,
      subtotal: totalAmount,
      total: totalAmount,
      notes: `Invoice for ${resourceName} subscription`,
      metadata: {
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        autoGenerated: true,
      },
    });
  }

  async processOverdueInvoices(): Promise<{ processed: number; errors: string[] }> {
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

  async generateInvoicePDF(invoiceID: string): Promise<Buffer> {
    const invoice = await this.findInvoiceByID(invoiceID);
    const customer = invoice.customer;

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4'
        });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Header
        doc.fontSize(20)
          .fillColor('#7B21BA')
          .text('NLC AI PLATFORM', 50, 50);

        doc.fontSize(10)
          .fillColor('#666666')
          .text('AI-Powered Coaching Solutions', 50, 75)
          .text('support@nextlevelcoach.ai', 50, 90)
          .text('nextlevelcoach.ai', 50, 105);

        // Invoice title and details
        doc.fontSize(24)
          .fillColor('#000000')
          .text('INVOICE', 400, 50);

        doc.fontSize(12)
          .text(`Invoice #: ${invoice.invoiceNumber}`, 400, 80)
          .text(`Date: ${invoice.issueDate.toLocaleDateString()}`, 400, 100)
          .text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, 400, 120)
          .text(`Status: ${invoice.status.toUpperCase()}`, 400, 140);

        // Bill to section
        doc.fontSize(14)
          .fillColor('#7B21BA')
          .text('BILL TO:', 50, 180);

        doc.fontSize(11)
          .fillColor('#000000')
          .text(customer.name, 50, 205)
          .text(customer.email, 50, 220);

        // Line items table
        const lineItems = JSON.parse(invoice.lineItems as string) as InvoiceLineItem[];
        const tableTop = 300;

        doc.strokeColor('#cccccc')
          .lineWidth(1)
          .moveTo(50, tableTop)
          .lineTo(550, tableTop)
          .stroke();

        // Table header
        doc.fontSize(12)
          .fillColor('#7B21BA')
          .text('Description', 50, tableTop + 10)
          .text('Qty', 350, tableTop + 10)
          .text('Price', 400, tableTop + 10)
          .text('Amount', 480, tableTop + 10);

        doc.strokeColor('#cccccc')
          .lineWidth(1)
          .moveTo(50, tableTop + 30)
          .lineTo(550, tableTop + 30)
          .stroke();

        // Line items
        let yPosition = tableTop + 45;
        lineItems.forEach((item) => {
          doc.fontSize(10)
            .fillColor('#000000')
            .text(item.description, 50, yPosition)
            .text(item.quantity.toString(), 350, yPosition)
            .text(`$${(item.unitPrice / 100).toFixed(2)}`, 400, yPosition)
            .text(`$${(item.amount / 100).toFixed(2)}`, 480, yPosition);
          yPosition += 20;
        });

        // Totals
        const totalsY = yPosition + 30;
        doc.fontSize(11)
          .text('Subtotal:', 400, totalsY)
          .text(`$${(invoice.subtotal / 100).toFixed(2)}`, 480, totalsY);

        if (invoice.taxAmount) {
          doc.text('Tax:', 400, totalsY + 20)
            .text(`${(invoice.taxAmount / 100).toFixed(2)}`, 480, totalsY + 20);
        }

        if (invoice.discountAmount) {
          doc.text('Discount:', 400, totalsY + 40)
            .text(`-${(invoice.discountAmount / 100).toFixed(2)}`, 480, totalsY + 40);
        }

        doc.strokeColor('#7B21BA')
          .lineWidth(2)
          .moveTo(400, totalsY + 65)
          .lineTo(550, totalsY + 65)
          .stroke();

        doc.fontSize(14)
          .fillColor('#7B21BA')
          .text('TOTAL:', 400, totalsY + 75)
          .text(`${(invoice.total / 100).toFixed(2)}`, 480, totalsY + 75);

        // Footer
        const footerY = totalsY + 120;
        doc.fontSize(8)
          .fillColor('#666666')
          .text('Thank you for your business!', 50, footerY)
          .text('For support, please contact us at support@nextlevelcoach.ai', 50, footerY + 12);

        if (invoice.status !== 'paid') {
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

  private async validateUser(userID: string, userType: UserType): Promise<void> {
    let user;
    if (userType === UserType.coach) {
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

  private generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${timestamp}-${random}`;
  }

  private getInvoiceIncludes() {
    return {
      subscription: {
        select: {
          status: true,
          billingCycle: true,
          plan: { select: { name: true } },
          community: { select: { name: true } },
          course: { select: { title: true } },
        },
      },
      transaction: {
        select: { status: true, stripePaymentID: true },
      },
    };
  }

  private mapInvoiceWithDetails(invoice: any): ExtendedInvoice {
    const getCustomerDetails = () => {
      // In a real implementation, you'd include customer data in the query
      // For now, return basic structure
      return {
        id: invoice.customerID,
        type: invoice.customerType,
        name: '', // Would be populated from join
        email: '', // Would be populated from join
      };
    };

    return {
      ...invoice,
      customer: getCustomerDetails(),
    };
  }
}
