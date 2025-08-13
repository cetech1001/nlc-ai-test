import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import {ClientQueryParams, CreateClient, UpdateClient, ClientWithDetails} from "@nlc-ai/types";

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ClientQueryParams, coachID: string) {
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

    const where: any = { coachID };

    if (status && status !== '') {
      where.status = status;
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
        emailThreads: {
          where: { status: 'active' },
          select: { id: true }
        }
      },
    });

    const clientsWithDetails: ClientWithDetails[] = result.data.map((client: any) => ({
      ...client,
      coursesBought: client.courseEnrollments?.length || 0,
      coursesCompleted: client.courseEnrollments?.filter((e: any) =>
        e.progressPercentage === 100 || e.completedAt
      ).length || 0,
      emailThreadsCount: client.emailThreads?.length || 0,
    }));

    return {
      data: clientsWithDetails,
      pagination: result.pagination,
    };
  }

  async getClientStats(coachID: string) {
    const [totalClients, activeClients, totalCoursesBought, coursesCompleted] = await Promise.all([
      this.prisma.client.count({ where: { coachID } }),
      this.prisma.client.count({ where: { coachID, status: 'active' } }),
      this.prisma.courseEnrollment.count({
        where: { client: { coachID } }
      }),
      this.prisma.courseEnrollment.count({
        where: {
          client: { coachID },
          OR: [
            { progressPercentage: 100 },
            { completedAt: { not: null } }
          ]
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

  async findOne(id: string, coachID: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, coachID },
      include: {
        courseEnrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                totalModules: true,
                estimatedDurationHours: true
              }
            }
          }
        },
        emailThreads: {
          where: { status: 'active' },
          orderBy: { lastMessageAt: 'desc' },
          take: 5,
          select: {
            id: true,
            subject: true,
            lastMessageAt: true,
            messageCount: true
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
    };
  }

  async create(createClientDto: CreateClient, coachID: string) {
    return this.prisma.client.create({
      data: {
        ...createClientDto,
        coachID,
      },
    });
  }

  async update(id: string, updateClientDto: UpdateClient, coachID: string) {
    await this.findOne(id, coachID);

    return this.prisma.client.update({
      where: { id },
      data: {
        ...updateClientDto,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string, coachID: string) {
    await this.findOne(id, coachID);

    return this.prisma.client.update({
      where: { id },
      data: {
        status: 'inactive',
        updatedAt: new Date(),
      },
    });
  }
}
