import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCoachDto, UpdateCoachDto } from './dto';
import { PrismaService } from "../prisma/prisma.service";

export type CoachStatus = 'active' | 'inactive' | 'blocked';

export interface CoachWithStatus {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  businessName?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  status: CoachStatus;
  currentPlan?: string;
  subscriptionStatus?: string;
}

@Injectable()
export class CoachesService {
  constructor(private prisma: PrismaService) {}

  // Helper method to determine coach status
  private determineCoachStatus(coach: any): CoachStatus {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (!coach.isActive) {
      return 'blocked';
    }

    if (coach.isActive && coach.lastLoginAt && coach.lastLoginAt > thirtyDaysAgo) {
      return 'active';
    }

    if (coach.isActive && (!coach.lastLoginAt || coach.lastLoginAt <= thirtyDaysAgo)) {
      return 'inactive';
    }

    return 'inactive'; // Default fallback
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: CoachStatus,
    search?: string
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get all coaches first (we'll filter by status after calculating it)
    const coaches = await this.prisma.coaches.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate status for each coach and filter if needed
    const coachesWithStatus: CoachWithStatus[] = coaches.map(coach => ({
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
      status: this.determineCoachStatus(coach),
      currentPlan: coach.subscriptions[0]?.plan?.name || 'No Plan',
      subscriptionStatus: coach.subscriptions[0]?.status || 'none',
    }));

    // Filter by status if specified
    const filteredCoaches = status
      ? coachesWithStatus.filter(coach => coach.status === status)
      : coachesWithStatus;

    // Apply pagination
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
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          include: {
            plan: true
          }
        },
        clients: {
          where: { status: 'active' },
          orderBy: { lastInteractionAt: 'desc' },
          take: 5,
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

    return {
      ...coach,
      status: this.determineCoachStatus(coach),
      currentPlan: coach.subscriptions[0]?.plan?.name || 'No Plan',
    };
  }

  async getCoachStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const coaches = await this.prisma.coaches.findMany({
      select: {
        id: true,
        isActive: true,
        lastLoginAt: true,
      }
    });

    const stats = coaches.reduce((acc, coach) => {
      const status = this.determineCoachStatus(coach);
      acc[status] = (acc[status] || 0) + 1;
      acc.total = (acc.total || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: stats.total || 0,
      active: stats.active || 0,
      inactive: stats.inactive || 0,
      blocked: stats.blocked || 0,
    };
  }

  async getInactiveCoaches(page = 1, limit = 10, search?: string) {
    return this.findAll(page, limit, 'inactive', search);
  }

  async create(createCoachDto: CreateCoachDto) {
    return this.prisma.coaches.create({
      data: {
        ...createCoachDto,
        // Set up default AI agents for new coach if needed
        coachAiAgents: {
          create: [
            // Add default AI agents here if they exist
          ],
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
      where: { id },
      data: {
        ...updateCoachDto,
        updatedAt: new Date(),
      },
    });
  }

  async toggleStatus(id: string) {
    const coach = await this.findOne(id);

    return this.prisma.coaches.update({
      where: { id },
      data: {
        isActive: !coach.isActive,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete - just deactivate the coach
    return this.prisma.coaches.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  // Business logic methods
  async getCoachKpis(coachId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalClients, activeClients, recentInteractions, aiUsage] = await Promise.all([
      this.prisma.clients.count({
        where: { coachId },
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
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.aiInteractions.aggregate({
        where: {
          coachId,
          createdAt: { gte: startDate },
        },
        _sum: {
          tokensUsed: true,
        },
      }),
    ]);

    return {
      totalClients,
      activeClients,
      recentInteractions,
      tokensUsed: aiUsage._sum.tokensUsed || 0,
    };
  }
}
