import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from './dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    const { name, description, monthlyPrice, annualPrice, maxClients, maxAiAgents, features, isActive } = createPlanDto;

    const existingPlan = await this.prisma.plans.findUnique({
      where: { name },
    });

    if (existingPlan) {
      throw new ConflictException('Plan with this name already exists');
    }

    return this.prisma.plans.create({
      data: {
        name,
        description,
        monthlyPrice,
        annualPrice,
        maxClients,
        maxAiAgents,
        features: features || [],
        isActive: isActive ?? true,
      },
    });
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };

    return this.prisma.plans.findMany({
      where,
      orderBy: [
        { monthlyPrice: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        _count: {
          select: {
            subscriptions: true,
            transactions: true,
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.plans.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: {
              where: { status: 'active' }
            },
            transactions: true,
          }
        }
      }
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    await this.findOne(id);

    const { name, ...otherData } = updatePlanDto;

    if (name) {
      const existingPlan = await this.prisma.plans.findFirst({
        where: {
          name,
          id: { not: id },
        },
      });

      if (existingPlan) {
        throw new ConflictException('Plan with this name already exists');
      }
    }

    return this.prisma.plans.update({
      where: { id },
      data: {
        name,
        ...otherData,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    const activeSubscriptions = await this.prisma.subscriptions.count({
      where: {
        planId: id,
        status: 'active',
      },
    });

    if (activeSubscriptions > 0) {
      throw new ConflictException('Cannot delete plan with active subscriptions. Deactivate it instead.');
    }

    return this.prisma.plans.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async toggleStatus(id: string) {
    const plan = await this.findOne(id);

    return this.prisma.plans.update({
      where: { id },
      data: { isActive: !plan.isActive },
    });
  }

  async getPlanAnalytics(id: string) {
    const plan = await this.findOne(id);

    const [totalRevenue, activeSubscriptions, totalSubscriptions] = await Promise.all([
      this.prisma.transactions.aggregate({
        where: {
          planId: id,
          status: 'completed',
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.subscriptions.count({
        where: {
          planId: id,
          status: 'active',
        },
      }),
      this.prisma.subscriptions.count({
        where: {
          planId: id,
        },
      }),
    ]);

    return {
      plan,
      analytics: {
        totalRevenue: totalRevenue._sum.amount || 0,
        activeSubscriptions,
        totalSubscriptions,
        conversionRate: totalSubscriptions > 0 ? (activeSubscriptions / totalSubscriptions) * 100 : 0,
      },
    };
  }
}
