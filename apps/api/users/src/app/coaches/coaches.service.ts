import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { CoachQueryParams, CoachStatus, CoachWithStatus, CreateCoach, UpdateCoach } from '@nlc-ai/api-types';

@Injectable()
export class CoachesService {
  constructor(
    private prisma: PrismaService,
  ) {}

  private determineCoachStatus(coach: any): CoachStatus {
    if (coach.isDeleted) {
      return CoachStatus.DELETED;
    }

    if (!coach.isActive) {
      return CoachStatus.BLOCKED;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (coach.lastLoginAt && coach.lastLoginAt > thirtyDaysAgo) {
      return CoachStatus.ACTIVE;
    }

    return CoachStatus.INACTIVE;
  }

  async findAll(query: CoachQueryParams) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      subscriptionPlan,
      dateJoinedStart,
      dateJoinedEnd,
      lastActiveStart,
      lastActiveEnd,
      isVerified,
      includeInactive = true,
      includeDeleted = false
    } = query;

    const where: any = {};

    if (!includeDeleted) {
      where.isDeleted = false;
    }

    if (status) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      switch (status) {
        case CoachStatus.DELETED:
          where.isDeleted = true;
          break;
        case CoachStatus.BLOCKED:
          where.isDeleted = false;
          where.isActive = false;
          break;
        case CoachStatus.ACTIVE:
          where.isDeleted = false;
          where.isActive = true;
          where.lastLoginAt = { gte: thirtyDaysAgo };
          break;
        case CoachStatus.INACTIVE:
          where.isDeleted = false;
          where.isActive = true;
          where.OR = [
            { lastLoginAt: { lt: thirtyDaysAgo } },
            { lastLoginAt: null }
          ];
          break;
      }
    } else {
      if (!includeInactive) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        where.AND = [
          {
            OR: [
              {
                isDeleted: false,
                isActive: true,
                lastLoginAt: { gte: thirtyDaysAgo }
              },
              {
                isDeleted: false,
                isActive: false
              }
            ]
          }
        ];
      }
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateJoinedStart || dateJoinedEnd) {
      where.createdAt = {};
      if (dateJoinedStart) {
        where.createdAt.gte = new Date(dateJoinedStart);
      }
      if (dateJoinedEnd) {
        const endDate = new Date(dateJoinedEnd);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    if (lastActiveStart || lastActiveEnd) {
      where.lastLoginAt = {
        ...where.lastLoginAt,
      };
      if (lastActiveStart) {
        where.lastLoginAt.gte = new Date(lastActiveStart);
      }
      if (lastActiveEnd) {
        const endDate = new Date(lastActiveEnd);
        endDate.setHours(23, 59, 59, 999);
        where.lastLoginAt.lte = endDate;
      }
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    if (subscriptionPlan) {
      const planNames = subscriptionPlan.split(',').map(p => p.trim());
      where.subscriptions = {
        some: {
          status: 'active',
          plan: {
            name: { in: planNames }
          }
        }
      };
    }

    const result = await this.prisma.paginate(this.prisma.coach, {
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: {
          where: { status: 'active' },
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            plan: {
              select: { name: true }
            }
          }
        },
        clientCoaches: {
          where: { status: 'active' },
          select: { id: true }
        },
        transactions: {
          where: { status: 'completed' },
          select: { amount: true }
        }
      },
    });

    const coachesWithStatus: CoachWithStatus[] = result.data.map((coach: any) => {
      const calculatedStatus = this.determineCoachStatus(coach);
      const totalRevenue = coach.transactions?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0;

      return {
        ...coach,
        status: calculatedStatus,
        currentPlan: coach.subscriptions?.[0]?.plan?.name || 'No Plan',
        subscriptionStatus: coach.subscriptions?.[0]?.status || 'none',
        clientCount: coach.clientCoaches?.length || 0,
        totalRevenue: Math.round(totalRevenue / 100),
      };
    });

    return {
      data: coachesWithStatus,
      pagination: result.pagination,
    };
  }

  async getCoachStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalCoaches, totalCoachesLastMonth, inactiveCoaches, inactiveCoachesLastMonth] = await Promise.all([
      this.prisma.coach.count(),
      this.prisma.coach.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lte: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
          }
        }
      }),
      this.prisma.coach.count({
        where: {
          isActive: true,
          lastLoginAt: { lte: thirtyDaysAgo }
        }
      }),
      this.prisma.coach.count({
        where: {
          isActive: true,
          lastLoginAt: {
            lte: new Date(new Date().setDate(new Date().getDate() - 60))
          }
        }
      })
    ]);

    const totalCoachesGrowth = totalCoachesLastMonth > 0
      ? ((totalCoaches - totalCoachesLastMonth) / totalCoachesLastMonth) * 100
      : 0;

    const inactiveCoachesGrowth = inactiveCoachesLastMonth > 0
      ? ((inactiveCoaches - inactiveCoachesLastMonth) / inactiveCoachesLastMonth) * 100
      : 0;

    return {
      totalCoaches,
      inactiveCoaches,
      totalCoachesGrowth: Math.round(totalCoachesGrowth * 100) / 100,
      inactiveCoachesGrowth: Math.round(inactiveCoachesGrowth * 100) / 100,
    };
  }

  async findOne(id: string) {
    const coach = await this.prisma.coach.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          include: {
            plan: true
          }
        },
        clientCoaches: {
          where: { status: 'active' },
          orderBy: { assignedAt: 'desc' },
          take: 5,
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                lastInteractionAt: true,
              }
            }
          }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            plan: {
              select: { name: true }
            }
          }
        }
      },
    });

    if (!coach) {
      throw new NotFoundException(`Coach with ID ${id} not found`);
    }

    const totalRevenue = await this.prisma.transaction.aggregate({
      where: {
        coachID: id,
        status: 'completed'
      },
      _sum: { amount: true }
    });

    return {
      ...coach,
      status: this.determineCoachStatus(coach),
      currentPlan: coach.subscriptions[0]?.plan?.name || 'No Plan',
      totalRevenue: Math.round((totalRevenue._sum.amount || 0) / 100),
    };
  }

  async create(createCoachDto: CreateCoach) {
    return this.prisma.coach.create({
      data: {
        ...createCoachDto,
      },
    });
  }

  async update(id: string, updateCoachDto: UpdateCoach) {
    await this.findOne(id);

    return this.prisma.coach.update({
      where: { id },
      data: {
        ...updateCoachDto,
        updatedAt: new Date(),
      },
    });
  }

  async toggleStatus(id: string) {
    const coach = await this.findOne(id);

    if (coach.isDeleted) {
      throw new BadRequestException('Cannot toggle status of deleted coaches');
    }

    return this.prisma.coach.update({
      where: { id },
      data: {
        isActive: !coach.isActive,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.coach.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    const coach = await this.prisma.coach.findUnique({
      where: { id },
      include: {
        subscriptions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            plan: true
          }
        },
        clientCoaches: {
          where: { status: 'active' },
          select: { id: true }
        },
        transactions: {
          where: { status: 'completed' },
          select: { amount: true }
        }
      },
    });

    if (!coach) {
      throw new NotFoundException(`Coach with ID ${id} not found`);
    }

    if (!coach.isDeleted) {
      throw new BadRequestException('Coach is not deleted');
    }

    const existingCoach = await this.prisma.coach.findFirst({
      where: {
        email: coach.email,
        isDeleted: false,
        id: { not: id },
      },
    });

    if (existingCoach) {
      throw new ConflictException('A coach with this email already exists');
    }

    const restoredCoach = await this.prisma.coach.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        isActive: true,
        updatedAt: new Date(),
      },
      include: {
        subscriptions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            plan: true
          }
        },
        clientCoaches: {
          where: { status: 'active' },
          select: { id: true }
        },
        transactions: {
          where: { status: 'completed' },
          select: { amount: true }
        }
      },
    });

    const totalRevenue = await this.prisma.transaction.aggregate({
      where: {
        coachID: id,
        status: 'completed'
      },
      _sum: { amount: true }
    });

    return {
      ...restoredCoach,
      status: this.determineCoachStatus(restoredCoach),
      currentPlan: restoredCoach.subscriptions[0]?.plan?.name || 'No Plan',
      totalRevenue: Math.round((totalRevenue._sum.amount || 0) / 100),
    };
  }

  async getCoachKpis(coachID: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalClients, activeClients, recentInteractions, aiUsage, totalRevenue] = await Promise.all([
      this.prisma.clientCoach.count({
        where: { coachID },
      }),
      this.prisma.clientCoach.count({
        where: {
          coachID,
          status: 'active',
        },
      }),
      this.prisma.aiInteraction.count({
        where: {
          coachID,
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.aiInteraction.aggregate({
        where: {
          coachID,
          createdAt: { gte: startDate },
        },
        _sum: {
          tokensUsed: true,
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          coachID,
          status: 'completed',
          createdAt: { gte: startDate },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalClients,
      activeClients,
      recentInteractions,
      tokensUsed: aiUsage._sum.tokensUsed || 0,
      recentRevenue: Math.round((totalRevenue._sum.amount || 0) / 100),
    };
  }
}
