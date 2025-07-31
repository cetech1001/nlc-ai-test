import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuthUser,
  Coach,
  RevenueGrowthData,
  Transaction,
  TransactionsQueryParams,
  TransactionStatus,
  TransactionWithDetails, UserType
} from "@nlc-ai/types";

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: TransactionsQueryParams, user: AuthUser) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      startDate,
      endDate,
      paymentMethod,
      minAmount,
      maxAmount,
      planNames,
    } = query;

    const where: any = {};

    if (user.type === UserType.coach) {
      where.coachID = user.id;
    }

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      const methods = paymentMethod.split(',').map(m => m.trim());
      where.paymentMethod = { in: methods };
    }

    if (planNames) {
      const names = planNames.split(',').map(n => n.trim());
      where.plan = {
        name: { in: names }
      };
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) {
        where.amount.gte = parseFloat(String(minAmount)) * 100;
      }
      if (maxAmount) {
        where.amount.lte = parseFloat(String(maxAmount)) * 100;
      }
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

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

    const result = await this.prisma.paginate(this.prisma.transaction, {
      page,
      limit,
      where,
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
    });

    const transactionsWithDetails: TransactionWithDetails[] = result.data.map((transaction: Transaction) => ({
      id: transaction.id,
      coachID: transaction.coachID,
      coachName: `${transaction.coach?.firstName} ${transaction.coach?.lastName}`,
      coachEmail: transaction.coach?.email,
      planName: transaction.plan?.name,
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
      pagination: result.pagination,
    };
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
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
      this.prisma.transaction.count(),
      this.prisma.transaction.count({ where: { status: 'completed' } }),
      this.prisma.transaction.count({ where: { status: 'pending' } }),
      this.prisma.transaction.count({ where: { status: 'failed' } }),
      this.prisma.transaction.aggregate({
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

  async generateInvoicePDF(transactionID: string): Promise<Buffer> {
    const transaction = await this.findOne(transactionID);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4'
        });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Company header
        doc.fontSize(20)
          .fillColor('#7B21BA')
          .text('NLC AI PLATFORM', 50, 50);

        doc.fontSize(10)
          .fillColor('#666666')
          .text('AI-Powered Coaching Solutions', 50, 75)
          .text('support@nextlevelcoach.ai', 50, 90)
          .text('nextlevelcoach.ai', 50, 105);

        // Invoice title and number
        doc.fontSize(24)
          .fillColor('#000000')
          .text('INVOICE', 400, 50);

        doc.fontSize(12)
          .text(`Invoice #: ${transaction.invoiceNumber || transaction.id.slice(0, 8).toUpperCase()}`, 400, 80)
          .text(`Date: ${new Date(transaction.invoiceDate).toLocaleDateString()}`, 400, 100)
          .text(`Due Date: ${transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString() : 'N/A'}`, 400, 120)
          .text(`Status: ${transaction.status.toUpperCase()}`, 400, 140);

        // Bill to section
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

        // Line separator
        doc.strokeColor('#cccccc')
          .lineWidth(1)
          .moveTo(50, 280)
          .lineTo(550, 280)
          .stroke();

        // Table header
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

        // Table line
        doc.strokeColor('#cccccc')
          .lineWidth(1)
          .moveTo(50, tableTop + 20)
          .lineTo(550, tableTop + 20)
          .stroke();

        // Invoice items
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

        // Totals section
        const subtotalY = nextY + 30;
        const totalX = 450;

        doc.fontSize(11)
          .fillColor('#000000')
          .text('Subtotal:', 400, subtotalY)
          .text(`$${(transaction.amount / 100).toFixed(2)}`, totalX, subtotalY);

        const taxY = subtotalY + 20;
        doc.text('Tax (0%):', 400, taxY)
          .text('$0.00', totalX, taxY);

        // Total line
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

        // Payment information
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

        // Footer - positioned to fit on the same page
        const footerY = Math.max(paymentInfoY + 40, 650); // Ensure footer starts at reasonable position
        doc.fontSize(8)
          .fillColor('#666666')
          .text('Thank you for choosing NLC AI Platform for your coaching needs.', 50, footerY)
          .text('For support, please contact us at support@nextlevelcoach.ai', 50, footerY + 12)
          .text('This invoice was generated automatically by the NLC AI Platform.', 50, footerY + 24);

        // Add watermark for unpaid invoices FIRST (behind other content)
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

  async getTransactionExport(transactionID: string) {
    const transaction = await this.findOne(transactionID);

    return {
      transactionID: transaction.id,
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
    const transactions = await this.prisma.transaction.findMany({
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

  async getTransactionsByStatus(status: TransactionStatus) {
    return this.prisma.transaction.findMany({
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
    return this.prisma.transaction.findMany({
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
    const result = await this.prisma.transaction.groupBy({
      by: ['coachID'],
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

    const coachIDs: string[] = result.map((r: any) => r.coachID);
    const coaches = await this.prisma.coach.findMany({
      where: {
        id: {
          in: coachIDs,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return result.map((r: any) => {
      const coach = coaches.find((c: Coach) => c.id === r.coachID);
      return {
        coachID: r.coachID,
        coachName: coach ? `${coach.firstName} ${coach.lastName}` : 'Unknown',
        coachEmail: coach?.email || 'Unknown',
        totalAmount: Math.round((r._sum.amount || 0) / 100),
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
      this.prisma.transaction.aggregate({
        where: {
          status: 'completed',
          createdAt: {
            gte: currentMonth,
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
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

  async updateTransactionStatus(id: string, status: TransactionStatus) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const updatedTransaction = await this.prisma.transaction.update({
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

    const transactions = await this.prisma.transaction.findMany({
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

    const trends = transactions.reduce((acc: any, transaction: any) => {
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

    return Object.entries(trends).map(([period, data]: any) => ({
      period,
      revenue: Math.round(data.revenue / 100), // Convert from cents
      transactionCount: data.count,
    })).sort((a, b) => a.period.localeCompare(b.period));
  }

  async getPaymentMethodBreakdown() {
    const result = await this.prisma.transaction.groupBy({
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

    const totalRevenue = result.reduce((sum: any, r: any) => sum + (r._sum.amount || 0), 0);

    return result.map((r: any) => ({
      paymentMethod: r.paymentMethod,
      totalAmount: Math.round((r._sum.amount || 0) / 100),
      transactionCount: r._count.id,
      percentage: totalRevenue > 0 ? Math.round(((r._sum.amount || 0) / totalRevenue) * 100 * 100) / 100 : 0,
    })).sort((a: any, b: any) => b.totalAmount - a.totalAmount);
  }

  async refundTransaction(id: string, reason?: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (transaction.status !== 'completed') {
      throw new Error('Only completed transactions can be refunded');
    }

    return this.prisma.transaction.update({
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
