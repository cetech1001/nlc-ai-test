import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {PaymentMethod, PaymentMethodType} from '@prisma/client';
import {
  CreatePaymentMethodRequest,
  PaymentMethodFilters,
  PaymentMethodWithDetails,
  UpdatePaymentMethodRequest
} from "@nlc-ai/api-types";
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPaymentMethod(data: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    // Validate coach exists
    const coach = await this.prisma.coach.findUnique({
      where: { id: data.coachID },
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    // Validate card expiration if provided
    if (data.cardExpMonth && data.cardExpYear) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // getMonth() is 0-based
      const currentYear = now.getFullYear();

      if (data.cardExpYear < currentYear ||
          (data.cardExpYear === currentYear && data.cardExpMonth < currentMonth)) {
        throw new BadRequestException('Card expiration date is in the past');
      }
    }

    // If setting as default, unset other default payment methods for this coach
    if (data.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: {
          coachID: data.coachID,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    try {
      return this.prisma.paymentMethod.create({
        data: {
          coachID: data.coachID,
          type: data.type,
          isDefault: data.isDefault || false,
          isActive: true,
          cardLast4: data.cardLast4,
          cardBrand: data.cardBrand,
          cardExpMonth: data.cardExpMonth,
          cardExpYear: data.cardExpYear,
          stripePaymentMethodID: data.stripePaymentMethodID,
          paypalEmail: data.paypalEmail,
        },
        include: {
          coach: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to create payment method: ${error.message}`);
    }
  }

  async findAllPaymentMethods(filters: PaymentMethodFilters = {}): Promise<PaymentMethodWithDetails[]> {
    const where: any = {};

    if (filters.coachID) {
      where.coachID = filters.coachID;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.isDefault !== undefined) {
      where.isDefault = filters.isDefault;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.cardBrand) {
      where.cardBrand = filters.cardBrand;
    }

    if (filters.expiringBefore) {
      const targetMonth = filters.expiringBefore.getMonth() + 1;
      const targetYear = filters.expiringBefore.getFullYear();

      where.OR = [
        { cardExpYear: { lt: targetYear } },
        {
          cardExpYear: targetYear,
          cardExpMonth: { lte: targetMonth }
        }
      ];
    }

    return this.prisma.paymentMethod.findMany({
      where,
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
    });
  }

  async findPaymentMethodById(id: string): Promise<PaymentMethodWithDetails> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    return paymentMethod;
  }

  async findCoachPaymentMethods(coachID: string): Promise<PaymentMethodWithDetails[]> {
    return this.findAllPaymentMethods({ coachID, isActive: true });
  }

  async findDefaultPaymentMethod(coachID: string): Promise<PaymentMethodWithDetails | null> {
    return this.prisma.paymentMethod.findFirst({
      where: {
        coachID,
        isDefault: true,
        isActive: true,
      },
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async updatePaymentMethod(id: string, data: UpdatePaymentMethodRequest): Promise<PaymentMethod> {
    const existingPaymentMethod = await this.findPaymentMethodById(id);

    // Validate card expiration if updating
    if (data.cardExpMonth && data.cardExpYear) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      if (data.cardExpYear < currentYear ||
          (data.cardExpYear === currentYear && data.cardExpMonth < currentMonth)) {
        throw new BadRequestException('Card expiration date is in the past');
      }
    }

    // If setting as default, unset other default payment methods for this coach
    if (data.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: {
          coachID: existingPaymentMethod.coachID,
          isDefault: true,
          id: { not: id }, // Exclude the current payment method
        },
        data: {
          isDefault: false,
        },
      });
    }

    try {
      return this.prisma.paymentMethod.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to update payment method: ${error.message}`);
    }
  }

  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findPaymentMethodById(id);

    if (!paymentMethod.isActive) {
      throw new BadRequestException('Cannot set inactive payment method as default');
    }

    return this.updatePaymentMethod(id, { isDefault: true });
  }

  async deactivatePaymentMethod(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findPaymentMethodById(id);

    // If this is the default payment method, find another active one to set as default
    if (paymentMethod.isDefault) {
      const alternativePaymentMethod = await this.prisma.paymentMethod.findFirst({
        where: {
          coachID: paymentMethod.coachID,
          isActive: true,
          id: { not: id },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (alternativePaymentMethod) {
        await this.updatePaymentMethod(alternativePaymentMethod.id, { isDefault: true });
      }
    }

    return this.updatePaymentMethod(id, {
      isActive: false,
      isDefault: false,
    });
  }

  async deletePaymentMethod(id: string): Promise<void> {
    const paymentMethod = await this.findPaymentMethodById(id);

    // Check if this payment method is being used in any pending transactions
    const activeTransactions = await this.prisma.transaction.count({
      where: {
        coachID: paymentMethod.coachID,
        status: { in: ['pending', 'processing'] },
        // Note: We don't have a direct relationship between Transaction and PaymentMethod
        // This would need to be implemented based on your business logic
      },
    });

    if (activeTransactions > 0) {
      throw new BadRequestException('Cannot delete payment method with pending transactions');
    }

    // If this is the default payment method, find another active one to set as default
    if (paymentMethod.isDefault) {
      const alternativePaymentMethod = await this.prisma.paymentMethod.findFirst({
        where: {
          coachID: paymentMethod.coachID,
          isActive: true,
          id: { not: id },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (alternativePaymentMethod) {
        await this.updatePaymentMethod(alternativePaymentMethod.id, { isDefault: true });
      }
    }

    await this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  async getExpiringPaymentMethods(monthsAhead = 2): Promise<PaymentMethodWithDetails[]> {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + monthsAhead);

    return this.findAllPaymentMethods({
      expiringBefore: futureDate,
      isActive: true,
    });
  }

  async getPaymentMethodStats(filters: {
    coachID?: string;
  } = {}): Promise<{
    total: number;
    active: number;
    inactive: number;
    typeBreakdown: Record<PaymentMethodType, number>;
    cardBrandBreakdown: Record<string, number>;
    expiringThisMonth: number;
    expiringNextMonth: number;
    expiringInTwoMonths: number;
  }> {
    const where: any = {};

    if (filters.coachID) {
      where.coachID = filters.coachID;
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const twoMonthsAhead = nextMonth === 12 ? 1 : nextMonth + 1;
    const twoMonthsAheadYear = nextMonth === 12 ? nextMonthYear + 1 : nextMonthYear;

    const [
      totalStats,
      typeStats,
      cardBrandStats,
      expiringThisMonth,
      expiringNextMonth,
      expiringInTwoMonths,
    ] = await Promise.all([
      this.prisma.paymentMethod.groupBy({
        by: ['isActive'],
        where,
        _count: { id: true },
      }),
      this.prisma.paymentMethod.groupBy({
        by: ['type'],
        where,
        _count: { id: true },
      }),
      this.prisma.paymentMethod.groupBy({
        by: ['cardBrand'],
        where: { ...where, cardBrand: { not: null } },
        _count: { id: true },
      }),
      this.prisma.paymentMethod.count({
        where: {
          ...where,
          cardExpYear: currentYear,
          cardExpMonth: currentMonth,
          isActive: true,
        },
      }),
      this.prisma.paymentMethod.count({
        where: {
          ...where,
          cardExpYear: nextMonthYear,
          cardExpMonth: nextMonth,
          isActive: true,
        },
      }),
      this.prisma.paymentMethod.count({
        where: {
          ...where,
          cardExpYear: twoMonthsAheadYear,
          cardExpMonth: twoMonthsAhead,
          isActive: true,
        },
      }),
    ]);

    const total = totalStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const active = totalStats.find(s => s.isActive)?._count.id || 0;
    const inactive = totalStats.find(s => !s.isActive)?._count.id || 0;

    const typeBreakdown = typeStats.reduce((acc, stat) => {
      acc[stat.type] = stat._count.id;
      return acc;
    }, {} as Record<PaymentMethodType, number>);

    const cardBrandBreakdown = cardBrandStats.reduce((acc, stat) => {
      if (stat.cardBrand) {
        acc[stat.cardBrand] = stat._count.id;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive,
      typeBreakdown,
      cardBrandBreakdown,
      expiringThisMonth,
      expiringNextMonth,
      expiringInTwoMonths,
    };
  }

  async validatePaymentMethod(id: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const paymentMethod = await this.findPaymentMethodById(id);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if payment method is active
    if (!paymentMethod.isActive) {
      errors.push('Payment method is inactive');
    }

    // Check card expiration
    if (paymentMethod.type === PaymentMethodType.credit_card ||
        paymentMethod.type === PaymentMethodType.debit_card) {
      if (!paymentMethod.cardExpMonth || !paymentMethod.cardExpYear) {
        errors.push('Card expiration date is missing');
      } else {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        if (paymentMethod.cardExpYear < currentYear ||
            (paymentMethod.cardExpYear === currentYear && paymentMethod.cardExpMonth < currentMonth)) {
          errors.push('Card has expired');
        } else if (paymentMethod.cardExpYear === currentYear &&
                   paymentMethod.cardExpMonth === currentMonth) {
          warnings.push('Card expires this month');
        } else if (paymentMethod.cardExpYear === currentYear &&
                   paymentMethod.cardExpMonth === currentMonth + 1) {
          warnings.push('Card expires next month');
        }
      }

      // Check for required card fields
      if (!paymentMethod.cardLast4) {
        warnings.push('Card last 4 digits are missing');
      }
      if (!paymentMethod.cardBrand) {
        warnings.push('Card brand is missing');
      }
    }

    // Check PayPal email
    if (paymentMethod.type === PaymentMethodType.paypal && !paymentMethod.paypalEmail) {
      errors.push('PayPal email is missing');
    }

    // Check Stripe payment method ID
    if (paymentMethod.type === PaymentMethodType.stripe && !paymentMethod.stripePaymentMethodID) {
      errors.push('Stripe payment method ID is missing');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async bulkValidatePaymentMethods(coachID?: string): Promise<{
    valid: number;
    invalid: number;
    withWarnings: number;
    details: Array<{
      id: string;
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }>;
  }> {
    const paymentMethods = await this.findAllPaymentMethods({ coachID, isActive: true });

    let valid = 0;
    let invalid = 0;
    let withWarnings = 0;

    const details = await Promise.all(
      paymentMethods.map(async (pm) => {
        const validation = await this.validatePaymentMethod(pm.id);

        if (validation.isValid) {
          valid++;
        } else {
          invalid++;
        }

        if (validation.warnings.length > 0) {
          withWarnings++;
        }

        return {
          id: pm.id,
          ...validation,
        };
      })
    );

    return {
      valid,
      invalid,
      withWarnings,
      details,
    };
  }

  async getCoachDefaultPaymentMethod(coachID: string): Promise<PaymentMethodWithDetails | null> {
    const defaultMethod = await this.findDefaultPaymentMethod(coachID);

    if (!defaultMethod) {
      // If no default method, try to find any active payment method
      return this.prisma.paymentMethod.findFirst({
        where: {
          coachID,
          isActive: true,
        },
        include: {
          coach: {
            select: {firstName: true, lastName: true, email: true},
          },
        },
        orderBy: {createdAt: 'desc'},
      });
    }

    return defaultMethod;
  }
}
