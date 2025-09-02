// apps/api/billing/src/app/payment-methods/payment-methods.service.ts
import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {PaymentMethod, PaymentMethodType} from '@prisma/client';
import {
  CreatePaymentMethodRequest,
  ExtendedPaymentMethod,
  Paginated,
  PaymentMethodFilters,
  TransactionStatus,
  UpdatePaymentMethodRequest,
  UserType
} from "@nlc-ai/api-types";
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPaymentMethod(data: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    // Validate user exists
    await this.validateUser(data);

    // Validate card expiration if provided
    if (data.cardExpMonth && data.cardExpYear) {
      this.validateCardExpiration(data.cardExpYear, data.cardExpMonth);
    }

    // If setting as default, remove default flag from other payment methods
    if (data.isDefault) {
      await this.clearDefaultPaymentMethods(data);
    }

    try {
      return this.prisma.paymentMethod.create({
        data: {
          coachID: data.coachID,
          clientID: data.clientID,
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
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to create payment method: ${error.message}`);
    }
  }

  async findAllPaymentMethods(filters: PaymentMethodFilters = {}): Promise<Paginated<ExtendedPaymentMethod>> {
    const where: any = {};

    // Handle unified user filtering
    if (filters.userID && filters.userType) {
      if (filters.userType === UserType.coach) {
        where.coachID = filters.userID;
      } else if (filters.userType === UserType.client) {
        where.clientID = filters.userID;
      }
    }

    if (filters.type) where.type = filters.type;
    if (filters.isDefault !== undefined) where.isDefault = filters.isDefault;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.cardBrand) where.cardBrand = filters.cardBrand;

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

    const result = await this.prisma.paginate(this.prisma.paymentMethod, {
      where,
      include: this.getPaymentMethodIncludes(),
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    return {
      ...result,
      data: result.data.map(pm => this.mapPaymentMethodWithDetails(pm)),
    };
  }

  async findPaymentMethodByID(id: string): Promise<ExtendedPaymentMethod> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
      include: this.getPaymentMethodIncludes(),
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    return this.mapPaymentMethodWithDetails(paymentMethod);
  }

  async getDefaultPaymentMethod(userID: string, userType: UserType): Promise<ExtendedPaymentMethod | null> {
    const where: any = {
      isDefault: true,
      isActive: true,
    };

    if (userType === UserType.coach) {
      where.coachID = userID;
    } else {
      where.clientID = userID;
    }

    const defaultMethod = await this.prisma.paymentMethod.findFirst({
      where,
      include: this.getPaymentMethodIncludes(),
    });

    if (!defaultMethod) {
      // If no default, return the most recent active payment method
      where.isDefault = undefined; // Remove default requirement
      const fallbackMethod = await this.prisma.paymentMethod.findFirst({
        where,
        include: this.getPaymentMethodIncludes(),
        orderBy: { createdAt: 'desc' },
      });

      return fallbackMethod ? this.mapPaymentMethodWithDetails(fallbackMethod) : null;
    }

    return this.mapPaymentMethodWithDetails(defaultMethod);
  }

  async updatePaymentMethod(id: string, data: UpdatePaymentMethodRequest): Promise<PaymentMethod> {
    const existingPaymentMethod = await this.findPaymentMethodByID(id);

    // Validate card expiration if provided
    if (data.cardExpMonth && data.cardExpYear) {
      this.validateCardExpiration(data.cardExpYear, data.cardExpMonth);
    }

    try {
      // If setting as default, remove default flag from other payment methods
      if (data.isDefault) {
        const userData = {
          coachID: existingPaymentMethod.coachID,
          clientID: existingPaymentMethod.clientID,
        };
        await this.clearDefaultPaymentMethods(userData, id);
      }

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
    const paymentMethod = await this.findPaymentMethodByID(id);

    if (!paymentMethod.isActive) {
      throw new BadRequestException('Cannot set inactive payment method as default');
    }

    return this.updatePaymentMethod(id, { isDefault: true });
  }

  async deactivatePaymentMethod(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findPaymentMethodByID(id);

    if (paymentMethod.isDefault) {
      const userID = paymentMethod.coachID || paymentMethod.clientID!;
      const userType = paymentMethod.coachID ? UserType.coach : UserType.client;
      await this.setAlternateDefaultPaymentMethod(id, userID, userType);
    }

    return this.updatePaymentMethod(id, {
      isActive: false,
      isDefault: false,
    });
  }

  async deletePaymentMethod(id: string): Promise<void> {
    const paymentMethod = await this.findPaymentMethodByID(id);

    // Check for active transactions
    const activeTransactions = await this.prisma.transaction.count({
      where: {
        paymentMethodID: paymentMethod.id,
        status: { in: [TransactionStatus.PENDING, TransactionStatus.PROCESSING] },
      },
    });

    if (activeTransactions > 0) {
      throw new BadRequestException('Cannot delete payment method with pending transactions');
    }

    // Set alternate default if this was the default
    if (paymentMethod.isDefault) {
      const userID = paymentMethod.coachID || paymentMethod.clientID!;
      const userType = paymentMethod.coachID ? UserType.coach : UserType.client;
      await this.setAlternateDefaultPaymentMethod(id, userID, userType);
    }

    await this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  async getExpiringPaymentMethods(monthsAhead = 2): Promise<Paginated<ExtendedPaymentMethod>> {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + monthsAhead);

    return this.findAllPaymentMethods({
      expiringBefore: futureDate,
      isActive: true,
    });
  }

  async validatePaymentMethod(id: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const paymentMethod = await this.findPaymentMethodByID(id);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!paymentMethod.isActive) {
      errors.push('Payment method is inactive');
    }

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

      if (!paymentMethod.cardLast4) {
        warnings.push('Card last 4 digits are missing');
      }
      if (!paymentMethod.cardBrand) {
        warnings.push('Card brand is missing');
      }
    }

    if (paymentMethod.type === PaymentMethodType.paypal && !paymentMethod.paypalEmail) {
      errors.push('PayPal email is missing');
    }

    if (paymentMethod.type === PaymentMethodType.stripe && !paymentMethod.stripePaymentMethodID) {
      errors.push('Stripe payment method ID is missing');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async bulkValidatePaymentMethods(userID?: string, userType?: UserType): Promise<{
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
    const filters: PaymentMethodFilters = { isActive: true };

    if (userID && userType) {
      filters.userID = userID;
      filters.userType = userType;
    }

    const result = await this.findAllPaymentMethods(filters);
    const paymentMethods = result.data;

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

  private async validateUser(data: CreatePaymentMethodRequest): Promise<void> {
    if (!data.coachID && !data.clientID) {
      throw new BadRequestException('Either coachID or clientID must be provided');
    }

    if (data.coachID && data.clientID) {
      throw new BadRequestException('Cannot specify both coachID and clientID');
    }

    if (data.coachID) {
      const coach = await this.prisma.coach.findUnique({
        where: { id: data.coachID },
      });
      if (!coach) {
        throw new NotFoundException('Coach not found');
      }
    }

    if (data.clientID) {
      const client = await this.prisma.client.findUnique({
        where: { id: data.clientID },
      });
      if (!client) {
        throw new NotFoundException('Client not found');
      }
    }
  }

  private validateCardExpiration(year: number, month: number): void {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      throw new BadRequestException('Card expiration date is in the past');
    }
  }

  private async clearDefaultPaymentMethods(data: { coachID?: string | null; clientID?: string | null; }, excludeID?: string): Promise<void> {
    const where: any = { isDefault: true };

    if (excludeID) {
      where.id = { not: excludeID };
    }

    if (data.coachID) {
      where.coachID = data.coachID;
    } else if (data.clientID) {
      where.clientID = data.clientID;
    }

    await this.prisma.paymentMethod.updateMany({
      where,
      data: { isDefault: false },
    });
  }

  private async setAlternateDefaultPaymentMethod(excludeID: string, userID: string, userType: UserType): Promise<void> {
    const where: any = {
      isActive: true,
      id: { not: excludeID },
    };

    if (userType === UserType.coach) {
      where.coachID = userID;
    } else {
      where.clientID = userID;
    }

    const alternativePaymentMethod = await this.prisma.paymentMethod.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (alternativePaymentMethod) {
      await this.updatePaymentMethod(alternativePaymentMethod.id, { isDefault: true });
    }
  }

  private getPaymentMethodIncludes() {
    return {
      coach: {
        select: { firstName: true, lastName: true, email: true },
      },
      client: {
        select: { firstName: true, lastName: true, email: true },
      },
    };
  }

  private mapPaymentMethodWithDetails(paymentMethod: any): ExtendedPaymentMethod {
    return {
      ...paymentMethod,
      coach: paymentMethod.coach || null,
      client: paymentMethod.client || null,
    };
  }
}
