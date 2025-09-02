import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {Prisma, Subscription, SubscriptionStatus} from '@prisma/client';
import {
  CreateSubscriptionRequest,
  ExtendedSubscription,
  SubscriptionFilters,
  UpdateSubscriptionRequest,
  UserType
} from "@nlc-ai/api-types";
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubscription(data: CreateSubscriptionRequest): Promise<Subscription> {
    await this.validateUser(data.subscriberID, data.subscriberType);

    await this.validateSubscriptionContext(data);

    const existingSubscription = await this.findExistingSubscription(data);
    if (existingSubscription) {
      throw new BadRequestException('User already has an active subscription to this resource');
    }

    const now = new Date();
    let periodStart = data.currentPeriodStart || now;
    let periodEnd = data.currentPeriodEnd;
    let trialEnd: Date | null = null;
    let status: SubscriptionStatus = 'active';

    if (data.trialDays && data.trialDays > 0) {
      status = 'trialing';
      trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + data.trialDays);
      periodStart = trialEnd;
    }

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
      return this.prisma.subscription.create({
        data: {
          subscriberID: data.subscriberID,
          subscriberType: data.subscriberType,
          planID: data.planID,
          communityID: data.communityID,
          courseID: data.courseID,
          status,
          billingCycle: data.billingCycle,
          amount: data.amount,
          currency: data.currency || 'USD',
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          trialStart: data.trialDays ? now : null,
          trialEnd,
          nextBillingDate,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to create subscription: ${error.message}`);
    }
  }

  async findAllSubscriptions(filters: SubscriptionFilters = {}): Promise<ExtendedSubscription[]> {
    const where: Prisma.SubscriptionWhereInput = {};

    if (filters.subscriberID) where.subscriberID = filters.subscriberID;
    if (filters.subscriberType) where.subscriberType = filters.subscriberType;
    if (filters.planID) where.planID = filters.planID;
    if (filters.communityID) where.communityID = filters.communityID;
    if (filters.courseID) where.courseID = filters.courseID;
    if (filters.status) where.status = filters.status;
    if (filters.billingCycle) where.billingCycle = filters.billingCycle;

    if (filters.expiringBefore) {
      where.currentPeriodEnd = { lte: filters.expiringBefore };
    }

    if (filters.createdAfter) {
      where.createdAt = { gte: filters.createdAfter };
    }

    const subscriptions = await this.prisma.subscription.findMany({
      where,
      include: this.getSubscriptionIncludes(),
      orderBy: { createdAt: 'desc' },
    });

    let extendedSubscriptions: ExtendedSubscription[] = [];

    for (const subscription of subscriptions) {
      const extendedSub = await this.mapSubscriptionWithDetails(subscription);
      extendedSubscriptions.push(extendedSub);
    }

    return extendedSubscriptions;
  }

  async findSubscriptionByID(id: string): Promise<ExtendedSubscription> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        ...this.getSubscriptionIncludes(),
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.mapSubscriptionWithDetails(subscription);
  }

  async findActiveSubscription(subscriberID: string, subscriberType: 'coach' | 'client'): Promise<ExtendedSubscription | null> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        subscriberID,
        subscriberType,
        status: 'active',
      },
      include: this.getSubscriptionIncludes(),
    });

    return subscription ? this.mapSubscriptionWithDetails(subscription) : null;
  }

  async updateSubscription(id: string, data: UpdateSubscriptionRequest): Promise<Subscription> {
    await this.findSubscriptionByID(id);

    if (data.planID || data.communityID || data.courseID) {
      await this.validateSubscriptionContext({
        subscriberID: '',
        subscriberType: UserType.coach,
        planID: data.planID,
        communityID: data.communityID,
        courseID: data.courseID,
        billingCycle: 'monthly',
        amount: 0,
      });
    }

    try {
      return this.prisma.subscription.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to update subscription: ${error.message}`);
    }
  }

  async cancelSubscription(id: string, reason?: string, immediateCancel = false): Promise<Subscription> {
    const subscription = await this.findSubscriptionByID(id);

    if (subscription.status === 'canceled') {
      throw new BadRequestException('Subscription is already canceled');
    }

    const now = new Date();
    const canceledAt = immediateCancel ? now : subscription.currentPeriodEnd;

    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: immediateCancel ? 'canceled' : 'active',
        canceledAt,
        cancelReason: reason,
        updatedAt: now,
      },
    });
  }

  async reactivateSubscription(id: string): Promise<Subscription> {
    const subscription = await this.findSubscriptionByID(id);

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
    const subscription = await this.findSubscriptionByID(id);

    if (subscription.status !== 'active') {
      throw new BadRequestException('Only active subscription can be renewed');
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

  async getExpiringSubscriptions(daysAhead = 7): Promise<ExtendedSubscription[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.findAllSubscriptions({
      status: 'active',
      expiringBefore: futureDate,
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

  private async validateSubscriptionContext(data: Partial<CreateSubscriptionRequest>): Promise<void> {
    if (data.planID) {
      const plan = await this.prisma.plan.findUnique({
        where: { id: data.planID },
        select: { isActive: true, isDeleted: true }
      });
      if (!plan || !plan.isActive || plan.isDeleted) {
        throw new NotFoundException('Plan not found or inactive');
      }
    }

    if (data.communityID) {
      const community = await this.prisma.community.findUnique({
        where: { id: data.communityID },
        select: { isActive: true, isDeleted: true }
      });
      if (!community || !community.isActive || community.isDeleted) {
        throw new NotFoundException('Community not found or inactive');
      }
    }

    if (data.courseID) {
      const course = await this.prisma.course.findUnique({
        where: { id: data.courseID },
        select: { isActive: true, isPublished: true }
      });
      if (!course || !course.isActive || !course.isPublished) {
        throw new NotFoundException('Course not found or not available');
      }
    }

    const targets = [data.planID, data.communityID, data.courseID].filter(Boolean);
    if (targets.length !== 1) {
      throw new BadRequestException('Exactly one of planID, communityID, or courseID must be specified');
    }
  }

  private async findExistingSubscription(data: CreateSubscriptionRequest): Promise<Subscription | null> {
    const where: any = {
      subscriberID: data.subscriberID,
      subscriberType: data.subscriberType,
      status: 'active',
    };

    if (data.planID) where.planID = data.planID;
    if (data.communityID) where.communityID = data.communityID;
    if (data.courseID) where.courseID = data.courseID;

    return this.prisma.subscription.findFirst({ where });
  }

  private getSubscriptionIncludes() {
    return {
      plan: {
        select: { name: true, monthlyPrice: true, annualPrice: true }
      },
      community: {
        select: { name: true, slug: true, pricingType: true }
      },
      course: {
        select: { title: true, pricingType: true }
      },
    };
  }

  private async mapSubscriptionWithDetails(subscription: any): Promise<ExtendedSubscription> {
    const getSubscriberDetails = async () => {
      if (subscription.subscriberType === 'coach') {
        const coach = await this.prisma.coach.findUnique({
          where: { id: subscription.subscriberID },
          select: { firstName: true, lastName: true, email: true }
        });
        return coach ? {
          id: subscription.subscriberID,
          type: 'coach',
          name: `${coach.firstName} ${coach.lastName}`,
          email: coach.email
        } : null;
      } else {
        const client = await this.prisma.client.findUnique({
          where: { id: subscription.subscriberID },
          select: { firstName: true, lastName: true, email: true }
        });
        return client ? {
          id: subscription.subscriberID,
          type: 'client',
          name: `${client.firstName} ${client.lastName}`,
          email: client.email
        } : null;
      }
    };

    const subscriber = await getSubscriberDetails();

    return {
      ...subscription,
      subscriber: {
        id: subscription.subscriberID,
        type: subscription.subscriberType,
        name: subscriber?.name,
        email: subscriber?.email,
      },
    };
  }
}
