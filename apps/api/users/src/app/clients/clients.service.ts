import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ClientQueryParams, CreateClient, UpdateClient, ClientWithDetails } from '@nlc-ai/api-types';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async findAll(query: ClientQueryParams, coachID?: string) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      coursesBought,
      dateJoinedStart,
      dateJoinedEnd,
      lastInteractionStart,
      lastInteractionEnd,
    } = query;

    const where: any = {};

    // If coachID is provided, filter by coach relationships
    if (coachID) {
      where.clientCoaches = {
        some: {
          coachID,
          status: 'active'
        }
      };
    }

    if (status && status !== '') {
      where.isActive = status === 'active';
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (coursesBought) {
      const courseCount = parseInt(coursesBought);
      where.courseEnrollments = {
        _count: { gte: courseCount }
      };
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

    if (lastInteractionStart || lastInteractionEnd) {
      where.lastInteractionAt = {};
      if (lastInteractionStart) {
        where.lastInteractionAt.gte = new Date(lastInteractionStart);
      }
      if (lastInteractionEnd) {
        const endDate = new Date(lastInteractionEnd);
        endDate.setHours(23, 59, 59, 999);
        where.lastInteractionAt.lte = endDate;
      }
    }

    const result = await this.prisma.paginate(this.prisma.client, {
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        courseEnrollments: {
          include: {
            course: {
              select: { title: true }
            }
          }
        },
        clientCoaches: {
          where: { status: 'active' },
          include: {
            coach: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                businessName: true,
              }
            }
          }
        }
      },
    });

    const clientsWithDetails: ClientWithDetails[] = result.data.map((client: any) => ({
      ...client,
      coursesBought: client.courseEnrollments?.length || 0,
      coursesCompleted: client.courseEnrollments?.filter((e: any) =>
        e.progressPercentage === 100 || e.completedAt
      ).length || 0,
      coaches: client.clientCoaches?.map((cc: any) => ({
        id: cc.coach.id,
        name: `${cc.coach.firstName} ${cc.coach.lastName}`,
        businessName: cc.coach.businessName,
        isPrimary: cc.isPrimary,
      })) || [],
    }));

    return {
      data: clientsWithDetails,
      pagination: result.pagination,
    };
  }

  async getClientStats(coachID?: string) {
    const where: any = {};

    if (coachID) {
      where.clientCoaches = {
        some: {
          coachID,
          status: 'active'
        }
      };
    }

    const [totalClients, activeClients, totalCoursesBought, coursesCompleted] = await Promise.all([
      this.prisma.client.count({ where }),
      this.prisma.client.count({
        where: {
          ...where,
          isActive: true
        }
      }),
      this.prisma.courseEnrollment.count({
        where: coachID ? {
          client: {
            clientCoaches: {
              some: {
                coachID,
                status: 'active'
              }
            }
          }
        } : {}
      }),
      this.prisma.courseEnrollment.count({
        where: {
          OR: [
            { progressPercentage: 100 },
            { completedAt: { not: null } }
          ],
          ...(coachID ? {
            client: {
              clientCoaches: {
                some: {
                  coachID,
                  status: 'active'
                }
              }
            }
          } : {})
        }
      }),
    ]);

    return {
      totalClients,
      activeClients,
      totalCoursesBought,
      coursesCompleted,
    };
  }

  async findOne(id: string, coachID?: string) {
    const where: any = { id };

    if (coachID) {
      where.clientCoaches = {
        some: {
          coachID,
          status: 'active'
        }
      };
    }

    const client = await this.prisma.client.findFirst({
      where,
      include: {
        courseEnrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                estimatedDurationHours: true
              }
            }
          }
        },
        clientCoaches: {
          where: { status: 'active' },
          include: {
            coach: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                businessName: true,
              }
            }
          }
        }
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return {
      ...client,
      coursesBought: client.courseEnrollments?.length || 0,
      coursesCompleted: client.courseEnrollments?.filter((e: any) =>
        e.progressPercentage === 100 || e.completedAt
      ).length || 0,
      coaches: client.clientCoaches?.map((cc: any) => ({
        id: cc.coach.id,
        name: `${cc.coach.firstName} ${cc.coach.lastName}`,
        businessName: cc.coach.businessName,
        isPrimary: cc.isPrimary,
      })) || [],
    };
  }

  async create(createClientDto: CreateClient, coachID?: string) {
    if (!coachID) {
      throw new Error('Coach ID is required for client creation');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create the client
      const client = await tx.client.create({
        data: {
          ...createClientDto,
        },
      });

      // Create the client-coach relationship
      await tx.clientCoach.create({
        data: {
          clientID: client.id,
          coachID,
          status: 'active',
          isPrimary: true,
          assignedBy: coachID,
        },
      });

      return client;
    });
  }

  async update(id: string, updateClientDto: UpdateClient, coachID?: string) {
    await this.findOne(id, coachID);

    return this.prisma.client.update({
      where: { id },
      data: {
        ...updateClientDto,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string, coachID?: string) {
    await this.findOne(id, coachID);

    return this.prisma.client.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }
}
