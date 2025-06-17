import {Injectable, NotFoundException} from '@nestjs/common';
import { CreateCoachDto, UpdateCoachDto } from './dto';
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class CoachesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    return this.prisma.paginate(this.prisma.coaches, {
      page,
      limit,
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const coach = await this.prisma.coaches.findUnique({
      where: { id },
      include: {
        clients: {
          where: { status: 'active' },
          orderBy: { lastInteractionAt: 'desc' },
        },
        courseEnrollments: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!coach) {
      throw new NotFoundException(`Coach with ID ${id} not found`);
    }

    return coach;
  }

  async create(createCoachDto: CreateCoachDto) {
    return this.prisma.coaches.create({
      data: {
        ...createCoachDto,
        // Set up default AI agents for new coach
        coachAiAgents: {
          create: [
            { agentId: 'email-agent-uuid', isEnabled: true },
            { agentId: 'retention-agent-uuid', isEnabled: true },
            { agentId: 'followup-agent-uuid', isEnabled: true },
            { agentId: 'content-agent-uuid', isEnabled: true },
            { agentId: 'replica-agent-uuid', isEnabled: false },
          ],
        },
      },
      include: {
        coachAiAgents: {
          include: {
            agent: true,
          },
        },
      },
    });
  }

  async update(id: string, updateCoachDto: UpdateCoachDto) {
    await this.findOne(id);

    return this.prisma.coaches.update({
      where: { id },
      data: updateCoachDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete - just deactivate the coach
    return this.prisma.coaches.update({
      where: { id },
      data: { isActive: false },
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
