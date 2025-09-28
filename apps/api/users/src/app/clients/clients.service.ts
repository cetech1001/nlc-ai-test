import {ConflictException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import {ClientQueryParams, CreateClient, UpdateClient, ClientWithDetails} from '@nlc-ai/types';
import {AssignCoachDto} from "./dto";

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
      const client = await tx.client.create({
        data: {
          ...createClientDto,
        },
      });

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

  async assignCoach(clientID: string, assignCoachDto: AssignCoachDto, assignedBy: string) {
    const { coachID, notes, isPrimary = false } = assignCoachDto;

    const client = await this.prisma.client.findUnique({
      where: { id: clientID, isDeleted: false },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID, isDeleted: false, isActive: true },
    });

    if (!coach) {
      throw new NotFoundException('Coach not found or inactive');
    }

    const existingRelationship = await this.prisma.clientCoach.findUnique({
      where: {
        clientID_coachID: {
          clientID,
          coachID,
        }
      }
    });

    if (existingRelationship) {
      throw new ConflictException('Coach is already assigned to this client');
    }

    return this.prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.clientCoach.updateMany({
          where: {
            clientID,
            isPrimary: true,
          },
          data: {
            isPrimary: false,
            updatedAt: new Date(),
          },
        });
      }

      const relationship = await tx.clientCoach.create({
        data: {
          clientID,
          coachID,
          status: 'active',
          role: 'client',
          notes,
          isPrimary,
          assignedBy,
        },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          coach: {
            select: {
              firstName: true,
              lastName: true,
              businessName: true,
              email: true,
            }
          }
        },
      });

      return {
        message: 'Coach assigned successfully',
        relationship,
      };
    });
  }

  async removeCoach(clientID: string, coachID: string, removedBy: string, coachContext?: string) {
    const relationship = await this.prisma.clientCoach.findUnique({
      where: {
        clientID_coachID: {
          clientID,
          coachID,
        }
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        coach: {
          select: {
            firstName: true,
            lastName: true,
            businessName: true,
          }
        }
      },
    });

    if (!relationship) {
      throw new NotFoundException('Coach-client relationship not found');
    }

    if (coachContext && coachContext !== coachID) {
      throw new ForbiddenException('Coaches can only remove their own client relationships');
    }

    const wasPrimary = relationship.isPrimary;

    return this.prisma.$transaction(async (tx) => {
      await tx.clientCoach.update({
        where: {
          clientID_coachID: {
            clientID,
            coachID,
          }
        },
        data: {
          status: 'inactive',
          updatedAt: new Date(),
        },
      });

      if (wasPrimary) {
        const nextCoach = await tx.clientCoach.findFirst({
          where: {
            clientID,
            status: 'active',
            id: { not: relationship.id },
          },
          orderBy: { assignedAt: 'asc' },
        });

        if (nextCoach) {
          await tx.clientCoach.update({
            where: { id: nextCoach.id },
            data: {
              isPrimary: true,
              updatedAt: new Date(),
            },
          });
        }
      }

      return {
        message: 'Coach removed successfully',
        wasPrimary,
      };
    });
  }

  async setPrimaryCoach(clientID: string, coachID: string, updatedBy: string, coachContext?: string) {
    const relationship = await this.prisma.clientCoach.findUnique({
      where: {
        clientID_coachID: {
          clientID,
          coachID,
        }
      },
    });

    if (!relationship || relationship.status !== 'active') {
      throw new NotFoundException('Active coach-client relationship not found');
    }

    if (coachContext && coachContext !== coachID) {
      throw new ForbiddenException('Coaches can only set themselves as primary');
    }

    if (relationship.isPrimary) {
      return {
        message: 'Coach is already the primary coach for this client',
      };
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.clientCoach.updateMany({
        where: {
          clientID,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
          updatedAt: new Date(),
        },
      });

      const updatedRelationship = await tx.clientCoach.update({
        where: {
          clientID_coachID: {
            clientID,
            coachID,
          }
        },
        data: {
          isPrimary: true,
          updatedAt: new Date(),
        },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          coach: {
            select: {
              firstName: true,
              lastName: true,
              businessName: true,
            }
          }
        },
      });

      return {
        message: 'Primary coach updated successfully',
        relationship: updatedRelationship,
      };
    });
  }

  async getClientCoaches(clientID: string, coachContext?: string) {
    const where: any = {
      clientID,
      status: 'active',
    };

    if (coachContext) {
      const hasAccess = await this.prisma.clientCoach.findFirst({
        where: {
          clientID,
          coachID: coachContext,
          status: 'active',
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException('Access denied to this client');
      }
    }

    const coaches = await this.prisma.clientCoach.findMany({
      where,
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
            avatarUrl: true,
            bio: true,
            phone: true,
          }
        }
      },
      orderBy: [
        { isPrimary: 'desc' },
        { assignedAt: 'asc' },
      ],
    });

    return {
      clientID,
      coaches: coaches.map((relationship) => ({
        relationshipID: relationship.id,
        coach: relationship.coach,
        isPrimary: relationship.isPrimary,
        notes: relationship.notes,
        assignedAt: relationship.assignedAt,
        assignedBy: relationship.assignedBy,
      })),
    };
  }
}
