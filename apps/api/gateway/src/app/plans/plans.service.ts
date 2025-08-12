import {Injectable, NotFoundException, ConflictException, BadRequestException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from './dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    const { name, description, monthlyPrice, annualPrice, maxClients, maxAiAgents, features, isActive, color } = createPlanDto;

    const existingPlan = await this.prisma.plan.findUnique({
      where: { name },
    });

    if (existingPlan) {
      throw new ConflictException('Plan with this name already exists');
    }

    return this.prisma.plan.create({
      data: {
        name,
        description,
        monthlyPrice,
        annualPrice,
        maxClients,
        maxAiAgents,
        color,
        features: features || [],
        isActive: isActive ?? true,
      },
    });
  }

  async findAll(includeInactive = false, includeDeleted = false) {
    const where: any = {};

    if (!includeDeleted) {
      where.isDeleted = false;
    }

    if (!includeInactive) {
      where.isActive = true;
    }

    return this.prisma.plan.findMany({
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
    const plan = await this.prisma.plan.findUnique({
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

    if (!plan || plan.isDeleted) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    const plan = await this.findOne(id);

    if (plan.isDeleted) {
      throw new BadRequestException('Cannot update deleted plans');
    }

    const { name, ...otherData } = updatePlanDto;

    if (name) {
      const existingPlan = await this.prisma.plan.findFirst({
        where: {
          name,
          id: { not: id },
          isDeleted: false,
        },
      });

      if (existingPlan) {
        throw new ConflictException('Plan with this name already exists');
      }
    }

    console.log("Data: ", updatePlanDto);

    return this.prisma.plan.update({
      where: { id },
      data: {
        name,
        ...otherData,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        planID: id,
        status: 'active',
      },
    });

    if (activeSubscriptions > 0) {
      throw new ConflictException('Cannot delete plan with active subscriptions. Deactivate it instead.');
    }

    return this.prisma.plan.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false
      },
    });
  }

  async toggleStatus(id: string) {
    const plan = await this.findOne(id);

    if (plan.isDeleted) {
      throw new BadRequestException('Cannot toggle status of deleted plans');
    }

    return this.prisma.plan.update({
      where: { id },
      data: { isActive: !plan.isActive },
    });
  }

  async getPlanAnalytics(id: string) {
    const plan = await this.findOne(id);

    const [totalRevenue, activeSubscriptions, totalSubscriptions] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          planID: id,
          status: 'completed',
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.subscription.count({
        where: {
          planID: id,
          status: 'active',
        },
      }),
      this.prisma.subscription.count({
        where: {
          planID: id,
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

  async restore(id: string) {
    const plan = await this.prisma.plan.findUnique({
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

    if (!plan.isDeleted) {
      throw new BadRequestException('Plan is not deleted');
    }

    const existingPlan = await this.prisma.plan.findFirst({
      where: {
        name: plan.name,
        isDeleted: false,
        id: { not: id },
      },
    });

    if (existingPlan) {
      throw new ConflictException('A plan with this name already exists');
    }

    return this.prisma.plan.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        isActive: true,
        updatedAt: new Date(),
      },
    });
  }

  async permanentDeleteExpired() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredPlans = await this.prisma.plan.findMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lte: thirtyDaysAgo
        }
      }
    });

    for (const plan of expiredPlans) {
      await this.prisma.$transaction(async (tx) => {
        await tx.transaction.deleteMany({ where: { planID: plan.id } });
        await tx.subscription.deleteMany({ where: { planID: plan.id } });
        await tx.plan.delete({ where: { id: plan.id } });
      });
    }

    return { deletedCount: expiredPlans.length };
  }
}
