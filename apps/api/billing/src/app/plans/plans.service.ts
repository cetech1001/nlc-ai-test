import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {Plan, Prisma} from '@prisma/client';
import {CreatePlanRequest, PlanFilters, UpdatePlanRequest} from '@nlc-ai/api-types';
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async createPlan(data: CreatePlanRequest): Promise<Plan> {
    try {
      return this.prisma.plan.create({
        data: {
          name: data.name,
          description: data.description,
          monthlyPrice: data.monthlyPrice,
          annualPrice: data.annualPrice,
          color: data.color || '#7B21BA',
          maxClients: data.maxClients,
          maxAiAgents: data.maxAiAgents,
          features: data.features || {},
          isActive: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        throw new BadRequestException('Plan name already exists');
      }
      throw new BadRequestException(`Failed to create plan: ${error.message}`);
    }
  }

  async findAllPlans(filters: PlanFilters = {}): Promise<Plan[]> {
    const where: Prisma.PlanWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (!filters.includeInactive) {
      where.isActive = true;
    }

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters.priceRange) {
      where.monthlyPrice = {
        gte: filters.priceRange.min,
        lte: filters.priceRange.max,
      };
    }

    return this.prisma.plan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActivePlans(): Promise<Plan[]> {
    return this.prisma.plan.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      orderBy: { monthlyPrice: 'asc' },
    });
  }

  async findPlanById(id: string): Promise<Plan> {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true,
            transactions: true,
          },
        },
      },
    });

    if (!plan || plan.isDeleted) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async updatePlan(id: string, data: UpdatePlanRequest): Promise<Plan> {
    await this.findPlanById(id);

    try {
      return this.prisma.plan.update({
        where: {id},
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        throw new BadRequestException('Plan name already exists');
      }
      throw new BadRequestException(`Failed to update plan: ${error.message}`);
    }
  }

  async deactivatePlan(id: string): Promise<Plan> {
    await this.findPlanById(id);

    // Check if plan has active subscription
    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        planID: id,
        status: 'active',
      },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException('Cannot deactivate plan with active subscription');
    }

    return this.prisma.plan.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  async softDeletePlan(id: string): Promise<Plan> {
    await this.findPlanById(id);

    // Check if plan has any subscription or transactions
    const hasRelatedRecords = await this.prisma.plan.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            subscriptions: true,
            transactions: true,
          },
        },
      },
    });

    if (hasRelatedRecords) {
      if (hasRelatedRecords._count.subscriptions > 0 || hasRelatedRecords._count.transactions > 0) {
        throw new BadRequestException('Cannot delete plan with existing subscription or transactions');
      }
    }

    return this.prisma.plan.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getPlanStats(id: string): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalRevenue: number;
    monthlyRevenue: number;
  }> {
    const plan = await this.findPlanById(id);

    const [subscriptionStats, revenueStats] = await Promise.all([
      this.prisma.subscription.groupBy({
        by: ['status'],
        where: { planID: id },
        _count: { id: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          planID: id,
          status: 'completed',
        },
        _sum: { amount: true },
      }),
    ]);

    const totalSubscriptions = subscriptionStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const activeSubscriptions = subscriptionStats.find(stat => stat.status === 'active')?._count.id || 0;

    // Calculate monthly revenue based on active subscription
    const monthlyRevenue = activeSubscriptions * plan.monthlyPrice;

    return {
      totalSubscriptions,
      activeSubscriptions,
      totalRevenue: revenueStats._sum.amount || 0,
      monthlyRevenue,
    };
  }
}
