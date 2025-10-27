import {BadRequestException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {OutboxService} from '@nlc-ai/api-messaging';
import {
  CreateLandingLead,
  CreateLead,
  LEAD_ROUTING_KEYS,
  LeadEvent,
  LeadQueryParams,
  LeadStatus,
  LeadType,
  UpdateLead
} from '@nlc-ai/api-types';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async createFromLanding(dto: CreateLandingLead) {
    const { lead, answers, qualified, submittedAt } = dto;

    if (qualified) {
      const user = await this.prisma.coach.findFirst({
        where: {
          email: lead.email,
        }
      });
      if (user) {
        throw new BadRequestException('This email address is already in use.');
      }
    }

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const existingLead = await this.prisma.lead.findFirst({
      where: {
        email: lead.email,
        leadType: LeadType.ADMIN_LEAD,
        submittedAt: {
          gte: threeMonthsAgo,
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    if (existingLead) {
      throw new BadRequestException(
        'A submission with this email was already received within the last 3 months.'
      );
    }

    const oldLead = await this.prisma.lead.findFirst({
      where: {
        email: lead.email,
        leadType: LeadType.ADMIN_LEAD,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let newLead;

    if (oldLead) {
      newLead = await this.prisma.lead.update({
        where: {
          id: oldLead.id,
        },
        data: {
          name: lead.name,
          phone: lead.phone ?? null,
          status: LeadStatus.NOT_CONVERTED,
          answers: answers as any,
          qualified,
          marketingOptIn: lead.marketingOptIn,
          submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
        },
      });
    } else {
      newLead = await this.prisma.lead.create({
        data: {
          leadType: LeadType.ADMIN_LEAD,
          name: lead.name,
          email: lead.email,
          phone: lead.phone ?? null,
          source: 'Website',
          status: LeadStatus.NOT_CONVERTED,
          notes: null,
          answers: answers as any,
          qualified,
          marketingOptIn: lead.marketingOptIn,
          submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
        },
      });
    }

    await this.outbox.saveAndPublishEvent<LeadEvent>(
      {
        eventType: 'lead.landing.submitted',
        schemaVersion: 1,
        payload: {
          leadID: newLead.id,
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone || undefined,
          answers,
          marketingOptIn: newLead.marketingOptIn,
          qualified,
          submittedAt: newLead.submittedAt?.toISOString() || new Date().toISOString(),
        },
      },
      LEAD_ROUTING_KEYS.LANDING_SUBMITTED
    );

    return newLead;
  }

  async createFromChatbot(dto: {
    coachID: string;
    threadID: string;
    name: string;
    email?: string;
    phone?: string;
    marketingOptIn?: boolean;
  }) {
    const { coachID, threadID, name, email, phone, marketingOptIn } = dto;

    let existingLead = null;
    if (email) {
      existingLead = await this.prisma.lead.findFirst({
        where: {
          email,
          coachID,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    let lead;

    if (existingLead) {
      lead = await this.prisma.lead.update({
        where: {
          id: existingLead.id,
        },
        data: {
          name,
          phone: phone ?? existingLead.phone,
          marketingOptIn: marketingOptIn ?? existingLead.marketingOptIn,
          notes: existingLead.notes
            ? `${existingLead.notes}\n\nChatbot Thread: ${threadID}`
            : `Chatbot Thread: ${threadID}`,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Updated existing lead from chatbot: ${lead.id} (${lead.email})`);
    } else {
      lead = await this.prisma.lead.create({
        data: {
          leadType: LeadType.COACH_LEAD,
          coachID,
          name,
          email: email || `${threadID}@chatbot.temp`,
          phone: phone ?? null,
          source: 'Chatbot',
          status: LeadStatus.CONTACTED,
          marketingOptIn: marketingOptIn ?? false,
          notes: `Chatbot Thread: ${threadID}`,
        },
      });
    }

    return lead;
  }

  async findAll(query: LeadQueryParams) {
    const {
      page = 1,
      limit = 10,
      status,
      source,
      search,
      startDate,
      endDate,
      meetingStartDate,
      meetingEndDate,
      coachID,
    } = query;

    const where: any = {};

    if (coachID) {
      where.coachID = coachID;
    }

    if (status) {
      where.status = status;
    }

    if (source) {
      const sources = source.split(',').map(s => s.trim());
      where.source = { in: sources };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (meetingStartDate || meetingEndDate) {
      where.meetingDate = {};
      if (meetingStartDate) where.meetingDate.gte = new Date(meetingStartDate);
      if (meetingEndDate) {
        const end = new Date(meetingEndDate);
        end.setHours(23, 59, 59, 999);
        where.meetingDate.lte = end;
      }
    }

    return this.prisma.paginate(this.prisma.lead, {
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async getQualifiedLeads() {
    const qualifiedLeads = await this.prisma.lead.count({
      where: {
        qualified: true,
      }
    });
    return {
      remainingSpots: 100 - qualifiedLeads,
    }
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async create(createLeadDto: CreateLead, coachID?: string) {
    return await this.prisma.lead.create({
      data: {
        leadType: coachID ? LeadType.COACH_LEAD : LeadType.ADMIN_LEAD,
        coachID,
        ...createLeadDto,
        status: (createLeadDto.status || LeadStatus.CONTACTED) as LeadStatus,
        meetingDate: createLeadDto.meetingDate ? new Date(createLeadDto.meetingDate) : null,
      },
    });
  }

  async update(id: string, updateLeadDto: UpdateLead) {
    await this.findOne(id);

    return await this.prisma.lead.update({
      where: {id},
      data: {
        ...updateLeadDto,
        meetingDate: updateLeadDto.meetingDate ? new Date(updateLeadDto.meetingDate) : undefined,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.prisma.lead.delete({
      where: { id },
    });

    return { success: true, message: 'Lead deleted successfully' };
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    const data: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === LeadStatus.CONVERTED) {
      data.convertedAt = new Date();
    }

    if (status === LeadStatus.CONTACTED) {
      data.lastContactedAt = new Date();
    }

    return await this.prisma.lead.update({
      where: {id},
      data,
    });
  }

  async getStats(coachID?: string) {
    const whereClause = coachID ? { coachID } : {};

    const [total, contacted, scheduled, converted, unresponsive, disqualified] = await Promise.all([
      this.prisma.lead.count({ where: whereClause }),
      this.prisma.lead.count({ where: { ...whereClause, status: LeadStatus.CONTACTED } }),
      this.prisma.lead.count({ where: { ...whereClause, status: LeadStatus.SCHEDULED } }),
      this.prisma.lead.count({ where: { ...whereClause, status: LeadStatus.CONVERTED } }),
      this.prisma.lead.count({ where: { ...whereClause, status: LeadStatus.UNRESPONSIVE } }),
      this.prisma.lead.count({ where: { ...whereClause, qualified: false } }),
    ]);

    const conversionRate = total > 0 ? (converted / total) * 100 : 0;
    const qualificationRate = total > 0 ? ((converted + scheduled) / total) * 100 : 0;

    return {
      total,
      contacted,
      scheduled,
      converted,
      unresponsive,
      disqualified,
      conversionRate: Math.round(conversionRate * 100) / 100,
      qualificationRate: Math.round(qualificationRate * 100) / 100,
    };
  }

  async markAsContacted(leadID: string) {
    await this.findOne(leadID);

    await this.prisma.lead.update({
      where: { id: leadID },
      data: {
        lastContactedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { success: true, message: 'Lead marked as contacted' };
  }

  async scheduleMeeting(leadID: string, meetingDate: string, meetingTime?: string) {
    await this.findOne(leadID);

    return await this.prisma.lead.update({
      where: {id: leadID},
      data: {
        status: LeadStatus.SCHEDULED,
        meetingDate: new Date(meetingDate),
        meetingTime,
        updatedAt: new Date(),
      },
    });
  }
}
