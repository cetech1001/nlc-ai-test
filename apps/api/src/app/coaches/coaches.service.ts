import {BadRequestException, ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { CreateCoachDto, UpdateCoachDto } from './dto';
import { PrismaService } from "../prisma/prisma.service";
import { CoachQueryDto } from './dto/coach-query.dto';
import {CoachStatus, CoachWithStatus} from "@nlc-ai/types";

@Injectable()
export class CoachesService {
  constructor(private prisma: PrismaService) {
  }

  // Updated determineCoachStatus method
  private determineCoachStatus(coach: any): CoachStatus {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (coach.isDeleted) {
      return CoachStatus.DELETED;
    }

    if (!coach.isActive) {
      return CoachStatus.BLOCKED;
    }

    if (coach.lastLoginAt && coach.lastLoginAt > thirtyDaysAgo) {
      return CoachStatus.ACTIVE;
    }

    return CoachStatus.INACTIVE;
  }

  async findAll(query: CoachQueryDto) {
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

    const skip = (page - 1) * limit;

    const where: any = {};

    if (!includeDeleted) {
      where.isDeleted = false;
    }

    if (search) {
      where.OR = [
        {firstName: {contains: search, mode: 'insensitive'}},
        {lastName: {contains: search, mode: 'insensitive'}},
        {email: {contains: search, mode: 'insensitive'}},
        {businessName: {contains: search, mode: 'insensitive'}},
      ];
    }

    if (dateJoinedStart || dateJoinedEnd) {
      where.createdAt = {};
      if (dateJoinedStart) {
        where.createdAt.gte = new Date(dateJoinedStart);
      }
      if (dateJoinedEnd) {
        const endDate = new Date(dateJoinedEnd);
        endDate.setHours(23, 59, 59, 999); // End of day
        where.createdAt.lte = endDate;
      }
    }

    if (lastActiveStart || lastActiveEnd) {
      where.lastLoginAt = {};
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
            name: {in: planNames}
          }
        }
      };
    }

    const coaches = await this.prisma.coaches.findMany({
      where,
      include: {
        subscriptions: {
          where: {status: 'active'},
          take: 1,
          orderBy: {createdAt: 'desc'},
          include: {
            plan: {
              select: {name: true}
            }
          }
        },
        clients: {
          where: {status: 'active'},
          select: {id: true}
        },
        transactions: {
          where: {status: 'completed'},
          select: {amount: true}
        }
      },
      orderBy: {createdAt: 'desc'},
    });

    const coachesWithStatus: CoachWithStatus[] = coaches.map(coach => {
      const calculatedStatus = this.determineCoachStatus(coach);
      const totalRevenue = coach.transactions.reduce((sum, t) => sum + t.amount, 0);

      return {
        id: coach.id,
        firstName: coach.firstName,
        lastName: coach.lastName,
        email: coach.email,
        phone: coach.phone,
        businessName: coach.businessName,
        isActive: coach.isActive,
        isVerified: coach.isVerified,
        lastLoginAt: coach.lastLoginAt,
        createdAt: coach.createdAt,
        updatedAt: coach.updatedAt,
        status: calculatedStatus,
        currentPlan: coach.subscriptions[0]?.plan?.name || 'No Plan',
        subscriptionStatus: coach.subscriptions[0]?.status || 'none',
        clientCount: coach.clients.length,
        totalRevenue: Math.round(totalRevenue / 100),
      };
    });


    let filteredCoaches = coachesWithStatus;
    if (status) {
      filteredCoaches = coachesWithStatus.filter(coach => coach.status === status);
    }

    if (!includeInactive) {
      filteredCoaches = filteredCoaches.filter(coach => coach.status !== CoachStatus.INACTIVE);
    }

    const total = filteredCoaches.length;
    const paginatedCoaches = filteredCoaches.slice(skip, skip + limit);

    return {
      data: paginatedCoaches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const coach = await this.prisma.coaches.findUnique({
      where: {id},
      include: {
        subscriptions: {
          orderBy: {createdAt: 'desc'},
          include: {
            plan: true
          }
        },
        clients: {
          where: {status: 'active'},
          orderBy: {lastInteractionAt: 'desc'},
          take: 5,
        },
        transactions: {
          orderBy: {createdAt: 'desc'},
          take: 10,
          include: {
            plan: {
              select: {name: true}
            }
          }
        }
      },
    });

    if (!coach) {
      throw new NotFoundException(`Coach with ID ${id} not found`);
    }

    const totalRevenue = await this.prisma.transactions.aggregate({
      where: {
        coachId: id,
        status: 'completed'
      },
      _sum: {amount: true}
    });

    return {
      ...coach,
      status: this.determineCoachStatus(coach),
      currentPlan: coach.subscriptions[0]?.plan?.name || 'No Plan',
      totalRevenue: Math.round((totalRevenue._sum.amount || 0) / 100),
    };
  }

  async getCoachStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalCoaches, activeCoaches, blockedCoaches] = await Promise.all([
      this.prisma.coaches.count(),
      this.prisma.coaches.count({
        where: {
          isActive: true,
          lastLoginAt: {gte: thirtyDaysAgo}
        }
      }),
      this.prisma.coaches.count({
        where: {isActive: false}
      })
    ]);

    const inactiveCoaches = totalCoaches - activeCoaches - blockedCoaches;

    return {
      total: totalCoaches,
      active: activeCoaches,
      inactive: inactiveCoaches,
      blocked: blockedCoaches,
    };
  }

  async getInactiveCoaches(page = 1, limit = 10, search?: string) {
    const queryDto = new CoachQueryDto();
    queryDto.page = page;
    queryDto.limit = limit;
    queryDto.status = CoachStatus.INACTIVE;
    queryDto.search = search;

    return this.findAll(queryDto);
  }

  async create(createCoachDto: CreateCoachDto) {
    return this.prisma.coaches.create({
      // @ts-ignore
      data: {
        ...createCoachDto,
        coachAiAgents: {
          create: [],
        },
      },
      include: {
        subscriptions: {
          include: {
            plan: true
          }
        }
      },
    });
  }

  async update(id: string, updateCoachDto: UpdateCoachDto) {
    await this.findOne(id);

    return this.prisma.coaches.update({
      where: {id},
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

    return this.prisma.coaches.update({
      where: {id},
      data: {
        isActive: !coach.isActive,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.coaches.update({
      where: {id},
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    const coach = await this.prisma.coaches.findUnique({
      where: { id },
      include: {
        subscriptions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            plan: true
          }
        },
        clients: {
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

    // Check if there's already an active coach with the same email
    const existingCoach = await this.prisma.coaches.findFirst({
      where: {
        email: coach.email,
        isDeleted: false,
        id: { not: id },
      },
    });

    if (existingCoach) {
      throw new ConflictException('A coach with this email already exists');
    }

    const restoredCoach = await this.prisma.coaches.update({
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
        clients: {
          where: { status: 'active' },
          select: { id: true }
        },
        transactions: {
          where: { status: 'completed' },
          select: { amount: true }
        }
      },
    });

    const totalRevenue = await this.prisma.transactions.aggregate({
      where: {
        coachId: id,
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

  async getCoachKpis(coachId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalClients, activeClients, recentInteractions, aiUsage, totalRevenue] = await Promise.all([
      this.prisma.clients.count({
        where: {coachId},
      }),
      this.prisma.clients.count({
        where: {
          coachId,
          status: 'active',
        },
      }),
      this.prisma.aiInteractions.count({
        where: {
          coachId,
          createdAt: {gte: startDate},
        },
      }),
      this.prisma.aiInteractions.aggregate({
        where: {
          coachId,
          createdAt: {gte: startDate},
        },
        _sum: {
          tokensUsed: true,
        },
      }),
      this.prisma.transactions.aggregate({
        where: {
          coachId,
          status: 'completed',
          createdAt: {gte: startDate},
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

  async getRecentCoaches(limit = 6) {
    const coaches = await this.prisma.coaches.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            plan: {
              select: { name: true }
            }
          }
        }
      }
    });

    return coaches.map(coach => ({
      id: coach.id,
      name: `${coach.firstName} ${coach.lastName}`,
      email: coach.email,
      dateJoined: coach.createdAt?.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) || '',
      plan: coach.subscriptions[0]?.plan?.name || 'No Plan',
      status: this.determineCoachStatus(coach),
    }));
  }

  async permanentDeleteExpired() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredCoaches = await this.prisma.coaches.findMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lte: thirtyDaysAgo
        }
      }
    });

    for (const coach of expiredCoaches) {
      await this.prisma.$transaction(async (tx) => {
        await tx.clients.deleteMany({ where: { coachId: coach.id } });
        await tx.subscriptions.deleteMany({ where: { coachId: coach.id } });
        await tx.transactions.deleteMany({ where: { coachId: coach.id } });
        await tx.coaches.delete({ where: { id: coach.id } });
      });
    }

    return { deletedCount: expiredCoaches.length };
  }
}
