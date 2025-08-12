import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Subscription, SubscriptionStatus, BillingCycle, Prisma } from '@prisma/client';

export interface CreateSubscriptionDto {
  coachID: string;
  planID: string;
  billingCycle: BillingCycle;
  trialDays?: number;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}

export interface UpdateSubscriptionDto {
  planID?: string;
  billingCycle?: BillingCycle;
  status?: SubscriptionStatus;
  cancelReason?: string;
  nextBillingDate?: Date;
}

export interface SubscriptionFilters {
  coachID?: string;
  planID?: string;
  status?: SubscriptionStatus;
  billingCycle?: BillingCycle;
  expiringBefore?: Date;
  createdAfter?: Date;
}

export interface SubscriptionWithDetails extends Subscription {
  coach: {
    firstName: string;
    lastName: string;
    email: string;
  };
  plan: {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
  };
}

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubscription(data: CreateSubscriptionDto): Promise<Subscription> {
    // Validate coach exists
    const coach = await this.prisma.coach.findUnique({
      where: { id: data.coachID },
    });

    if (!coach) {
      throw new NotFoundException('Coach not found');
    }

    // Validate plan exists and is active
    const plan = await this.prisma.plan.findUnique({
      where: { id: data.planID },
    });

    if (!plan || !plan.isActive || plan.isDeleted) {
      throw new NotFoundException('Plan not found or inactive');
    }

    // Check for existing active subscription
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        coachID: data.coachID,
        status: 'active',
      },
    });

    if (existingSubscription) {
      throw new BadRequestException('Coach already has an active subscription');
    }

    const now = new Date();
    let periodStart = data.currentPeriodStart || now;
    let periodEnd = data.currentPeriodEnd;
    let trialEnd: Date | null = null;
    let status: SubscriptionStatus = 'active';

    // Handle trial period
    if (data.trialDays && data.trialDays > 0) {
      status = 'trialing';
      trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + data.trialDays);
      periodStart = trialEnd;
    }

    // Calculate period end based on billing cycle
    if (!periodEnd) {
      periodEnd = new Date(periodStart);
      if (data.billingCycle === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }
    }

    const nextBillingDate = new Date(periodEnd);

    try {
      const subscription = await this.prisma.subscription.create({
        data: {
          coachID: data.coachID,
          planID: data.planID,
          status,
          billingCycle: data.billingCycle,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          trialStart: data.trialDays ? now : null,
          trialEnd,
          nextBillingDate,
        },
        include: {
          coach: {
            select: { firstName: true, lastName: true, email: true },
          },
          plan: {
            select: { name: true, monthlyPrice: true, annualPrice: true },
          },
        },
      });

      return subscription;
    } catch (error: any) {
      throw new BadRequestException(`Failed to create subscription: ${error.message}`);
    }
  }

  async findAllSubscriptions(filters: SubscriptionFilters = {}): Promise<SubscriptionWithDetails[]> {
    const where: Prisma.SubscriptionWhereInput = {};

    if (filters.coachID) {
      where.coachID = filters.coachID;
    }

    if (filters.planID) {
      where.planID = filters.planID;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.billingCycle) {
      where.billingCycle = filters.billingCycle;
    }

    if (filters.expiringBefore) {
      where.currentPeriodEnd = {
        lte: filters.expiringBefore,
      };
    }

    if (filters.createdAfter) {
      where.createdAt = {
        gte: filters.createdAfter,
      };
    }

    return this.prisma.subscription.findMany({
      where,
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true },
        },
        plan: {
          select: { name: true, monthlyPrice: true, annualPrice: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSubscriptionById(id: string): Promise<SubscriptionWithDetails> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true },
        },
        plan: {
          select: { name: true, monthlyPrice: true, annualPrice: true },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async findCoachActiveSubscription(coachID: string): Promise<SubscriptionWithDetails | null> {
    return this.prisma.subscription.findFirst({
      where: {
        coachID,
        status: 'active',
      },
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true },
        },
        plan: {
          select: { name: true, monthlyPrice: true, annualPrice: true },
        },
      },
    });
  }

  async updateSubscription(id: string, data: UpdateSubscriptionDto): Promise<Subscription> {
    const existingSubscription = await this.findSubscriptionById(id);

    // Validate plan if changing
    if (data.planID && data.planID !== existingSubscription.planID) {
      const plan = await this.prisma.plan.findUnique({
        where: { id: data.planID },
      });

      if (!plan || !plan.isActive || plan.isDeleted) {
        throw new NotFoundException('Plan not found or inactive');
      }
    }

    try {
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return updatedSubscription;
    } catch (error: any) {
      throw new BadRequestException(`Failed to update subscription: ${error.message}`);
    }
  }

  async cancelSubscription(id: string, reason?: string, immediateCancel = false): Promise<Subscription> {
    const subscription = await this.findSubscriptionById(id);

    if (subscription.status === 'canceled') {
      throw new BadRequestException('Subscription is already canceled');
    }

    const now = new Date();
    const canceledAt = immediateCancel ? now : subscription.currentPeriodEnd;

    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: immediateCancel ? 'canceled' : 'active', // Keep active until period ends
        canceledAt,
        cancelReason: reason,
        updatedAt: now,
      },
    });
  }

  async reactivateSubscription(id: string): Promise<Subscription> {
    const subscription = await this.findSubscriptionById(id);

    if (subscription.status === 'active') {
      throw new BadRequestException('Subscription is already active');
    }

    if (subscription.status === 'expired') {
      throw new BadRequestException('Cannot reactivate expired subscription. Create a new one instead.');
    }

    const now = new Date();
    const periodEnd = new Date(now);

    if (subscription.billingCycle === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        nextBillingDate: periodEnd,
        canceledAt: null,
        cancelReason: null,
        updatedAt: now,
      },
    });
  }

  async renewSubscription(id: string): Promise<Subscription> {
    const subscription = await this.findSubscriptionById(id);

    if (subscription.status !== 'active') {
      throw new BadRequestException('Only active subscriptions can be renewed');
    }

    const currentPeriodEnd = subscription.currentPeriodEnd;
    const newPeriodStart = currentPeriodEnd;
    const newPeriodEnd = new Date(currentPeriodEnd);

    if (subscription.billingCycle === 'monthly') {
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
    } else {
      newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        nextBillingDate: newPeriodEnd,
        updatedAt: new Date(),
      },
    });
  }

  async getExpiringSubscriptions(daysAhead = 7): Promise<SubscriptionWithDetails[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          lte: futureDate,
        },
      },
      include: {
        coach: {
          select: { firstName: true, lastName: true, email: true },
        },
        plan: {
          select: { name: true, monthlyPrice: true, annualPrice: true },
        },
      },
      orderBy: { currentPeriodEnd: 'asc' },
    });
  }

  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    trialing: number;
    canceled: number;
    expired: number;
    monthlyRecurringRevenue: number;
    averageLifespan: number;
  }> {
    const [statusStats, revenueData, lifespanData] = await Promise.all([
      this.prisma.subscription.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.subscription.findMany({
        where: { status: 'active' },
        include: { plan: { select: { monthlyPrice: true, annualPrice: true } } },
      }),
      this.prisma.subscription.findMany({
        where: { status: 'canceled' },
        select: { createdAt: true, canceledAt: true },
      }),
    ]);

    const total = statusStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const active = statusStats.find(s => s.status === 'active')?._count.id || 0;
    const trialing = statusStats.find(s => s.status === 'trialing')?._count.id || 0;
    const canceled = statusStats.find(s => s.status === 'canceled')?._count.id || 0;
    const expired = statusStats.find(s => s.status === 'expired')?._count.id || 0;

    const monthlyRecurringRevenue = revenueData.reduce((sum, sub) => {
      const monthlyPrice = sub.billingCycle === 'monthly'
        ? sub.plan.monthlyPrice
        : sub.plan.annualPrice / 12;
      return sum + monthlyPrice;
    }, 0);

    const averageLifespan = lifespanData.length > 0
      ? lifespanData.reduce((sum, sub) => {
          const lifespan = sub.canceledAt
            ? (sub.canceledAt.getTime() - sub.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            : 0;
          return sum + lifespan;
        }, 0) / lifespanData.length
      : 0;

    return {
      total,
      active,
      trialing,
      canceled,
      expired,
      monthlyRecurringRevenue,
      averageLifespan: Math.round(averageLifespan),
    };
  }
}
