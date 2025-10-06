import {Injectable, NotFoundException, Logger, BadRequestException} from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import {
  CreateLead,
  CreateLandingLead,
  UpdateLead,
  LeadQueryParams,
  LeadStatus,
  LeadType,
  LEAD_ROUTING_KEYS,
  LeadEvent
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
          status: qualified ? LeadStatus.CONVERTED : LeadStatus.CONTACTED,
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
          status: qualified ? LeadStatus.CONVERTED : LeadStatus.CONTACTED,
          notes: null,
          answers: answers as any,
          qualified,
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

    this.logger.log(`Landing page lead created: ${newLead.id} (${newLead.email})`);
    return newLead;
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
    const lead = await this.prisma.lead.create({
      data: {
        leadType: coachID ? LeadType.COACH_LEAD : LeadType.ADMIN_LEAD,
        coachID,
        ...createLeadDto,
        status: (createLeadDto.status || LeadStatus.CONTACTED) as LeadStatus,
        meetingDate: createLeadDto.meetingDate ? new Date(createLeadDto.meetingDate) : null,
      },
    });

    // Emit event
    await this.outbox.saveAndPublishEvent<LeadEvent>(
      {
        eventType: 'lead.created',
        schemaVersion: 1,
        payload: {
          leadID: lead.id,
          coachID: lead.coachID || undefined,
          leadType: lead.leadType as LeadType,
          name: lead.name,
          email: lead.email,
          phone: lead.phone || undefined,
          source: lead.source || undefined,
          status: lead.status as LeadStatus,
          qualified: lead.qualified || undefined,
          createdAt: lead.createdAt.toISOString(),
        },
      },
      LEAD_ROUTING_KEYS.CREATED
    );

    this.logger.log(`Lead created: ${lead.id} (${lead.email})`);
    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLead) {
    await this.findOne(id);

    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        ...updateLeadDto,
        meetingDate: updateLeadDto.meetingDate ? new Date(updateLeadDto.meetingDate) : undefined,
        updatedAt: new Date(),
      },
    });

    // Emit update event
    await this.outbox.saveAndPublishEvent<LeadEvent>(
      {
        eventType: 'lead.updated',
        schemaVersion: 1,
        payload: {
          leadID: lead.id,
          coachID: lead.coachID || undefined,
          changes: updateLeadDto,
          updatedAt: lead.updatedAt.toISOString(),
        },
      },
      LEAD_ROUTING_KEYS.UPDATED
    );

    this.logger.log(`Lead updated: ${lead.id}`);
    return lead;
  }

  async remove(id: string) {
    const lead = await this.findOne(id);

    await this.prisma.lead.delete({
      where: { id },
    });

    // Emit deletion event
    await this.outbox.saveAndPublishEvent<LeadEvent>(
      {
        eventType: 'lead.deleted',
        schemaVersion: 1,
        payload: {
          leadID: lead.id,
          coachID: lead.coachID || undefined,
          name: lead.name,
          email: lead.email,
          deletedAt: new Date().toISOString(),
        },
      },
      LEAD_ROUTING_KEYS.DELETED
    );

    this.logger.log(`Lead deleted: ${lead.id}`);
    return { success: true, message: 'Lead deleted successfully' };
  }

  async updateStatus(id: string, status: string) {
    const existingLead = await this.findOne(id);
    const previousStatus = existingLead.status as LeadStatus;

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

    const lead = await this.prisma.lead.update({
      where: { id },
      data,
    });

    // Emit status change event
    await this.outbox.saveAndPublishEvent<LeadEvent>(
      {
        eventType: 'lead.status.changed',
        schemaVersion: 1,
        payload: {
          leadID: lead.id,
          coachID: lead.coachID || undefined,
          previousStatus,
          newStatus: status as LeadStatus,
          changedAt: lead.updatedAt.toISOString(),
        },
      },
      LEAD_ROUTING_KEYS.STATUS_CHANGED
    );

    // Emit specific events for important status changes
    if (status === LeadStatus.CONVERTED) {
      await this.outbox.saveAndPublishEvent<LeadEvent>(
        {
          eventType: 'lead.converted',
          schemaVersion: 1,
          payload: {
            leadID: lead.id,
            coachID: lead.coachID!,
            name: lead.name,
            email: lead.email,
            convertedAt: lead.convertedAt!.toISOString(),
          },
        },
        LEAD_ROUTING_KEYS.CONVERTED
      );
    }

    this.logger.log(`Lead status updated: ${lead.id} (${previousStatus} → ${status})`);
    return lead;
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

  async markAsContacted(leadID: string, contactMethod: 'email' | 'phone' | 'meeting', notes?: string) {
    const lead = await this.findOne(leadID);

    await this.prisma.lead.update({
      where: { id: leadID },
      data: {
        lastContactedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Emit contacted event
    await this.outbox.saveAndPublishEvent<LeadEvent>(
      {
        eventType: 'lead.contacted',
        schemaVersion: 1,
        payload: {
          leadID: lead.id,
          coachID: lead.coachID || undefined,
          contactMethod,
          notes,
          contactedAt: new Date().toISOString(),
        },
      },
      LEAD_ROUTING_KEYS.CONTACTED
    );

    this.logger.log(`Lead contacted: ${leadID} via ${contactMethod}`);
    return { success: true, message: 'Lead marked as contacted' };
  }

  async scheduleMeeting(leadID: string, meetingDate: string, meetingTime?: string) {
    const lead = await this.findOne(leadID);

    const updatedLead = await this.prisma.lead.update({
      where: { id: leadID },
      data: {
        status: LeadStatus.SCHEDULED,
        meetingDate: new Date(meetingDate),
        meetingTime,
        updatedAt: new Date(),
      },
    });

    // Emit meeting scheduled event
    await this.outbox.saveAndPublishEvent<LeadEvent>(
      {
        eventType: 'lead.meeting.scheduled',
        schemaVersion: 1,
        payload: {
          leadID: lead.id,
          coachID: lead.coachID || undefined,
          meetingDate: updatedLead.meetingDate!.toISOString(),
          meetingTime,
          scheduledAt: updatedLead.updatedAt.toISOString(),
        },
      },
      LEAD_ROUTING_KEYS.MEETING_SCHEDULED
    );

    this.logger.log(`Meeting scheduled for lead: ${leadID} on ${meetingDate}`);
    return updatedLead;
  }

  async assignToCoach(leadID: string, coachID: string) {
    const lead = await this.findOne(leadID);

    const updatedLead = await this.prisma.lead.update({
      where: { id: leadID },
      data: {
        coachID,
        leadType: LeadType.COACH_LEAD,
        updatedAt: new Date(),
      },
    });

    // Emit assignment event
    await this.outbox.saveAndPublishEvent<LeadEvent>(
      {
        eventType: 'lead.updated',
        schemaVersion: 1,
        payload: {
          leadID: lead.id,
          coachID,
          changes: { coachID, leadType: LeadType.COACH_LEAD },
          updatedAt: updatedLead.updatedAt.toISOString(),
        },
      },
      LEAD_ROUTING_KEYS.UPDATED
    );

    this.logger.log(`Lead assigned to coach: ${leadID} → ${coachID}`);
    return updatedLead;
  }

  async updateScore(leadID: string, score: number, scoreFactors?: Record<string, any>) {
    const lead = await this.findOne(leadID);

    // Note: This assumes you add a score field to the Lead model
    // For now, we'll store it in notes or a custom field
    const updatedLead = await this.prisma.lead.update({
      where: { id: leadID },
      data: {
        // score, // Uncomment when score field is added to schema
        updatedAt: new Date(),
      },
    });

    // Emit score update event
    await this.outbox.saveAndPublishEvent<LeadEvent>(
      {
        eventType: 'lead.score.updated',
        schemaVersion: 1,
        payload: {
          leadID: lead.id,
          coachID: lead.coachID || undefined,
          newScore: score,
          scoreFactors,
          updatedAt: updatedLead.updatedAt.toISOString(),
        },
      },
      LEAD_ROUTING_KEYS.SCORE_UPDATED
    );

    this.logger.log(`Lead score updated: ${leadID} (score: ${score})`);
    return updatedLead;
  }

  async getLeadsByStatus(status: LeadStatus, coachID?: string) {
    const where: any = { status };
    if (coachID) {
      where.coachID = coachID;
    }

    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRecentLeads(days: number = 7, coachID?: string) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const where: any = {
      createdAt: { gte: sinceDate },
    };

    if (coachID) {
      where.coachID = coachID;
    }

    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLeadsRequiringFollowup(coachID?: string) {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const where: any = {
      status: { in: [LeadStatus.CONTACTED, LeadStatus.SCHEDULED] },
      OR: [
        { lastContactedAt: { lt: threeDaysAgo } },
        { lastContactedAt: null },
      ],
    };

    if (coachID) {
      where.coachID = coachID;
    }

    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }
}
