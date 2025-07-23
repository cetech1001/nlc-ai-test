import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {CreateLeadRequest, LeadQueryParams, UpdateLead} from "@nlc-ai/types";

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

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
      where['coachID'] = coachID;
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
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
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

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async create(createLeadDto: CreateLeadRequest) {
    return this.prisma.lead.create({
      data: {
        ...createLeadDto,
        status: createLeadDto.status || 'contacted',
        meetingDate: createLeadDto.meetingDate ? new Date(createLeadDto.meetingDate) : null,
      },
    });
  }

  async update(id: string, updateLeadDto: UpdateLead) {
    await this.findOne(id);

    return this.prisma.lead.update({
      where: { id },
      data: {
        ...updateLeadDto,
        meetingDate: updateLeadDto.meetingDate ? new Date(updateLeadDto.meetingDate) : undefined,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.lead.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    const data: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'converted') {
      data.convertedAt = new Date();
    }

    if (status === 'contacted') {
      data.lastContactedAt = new Date();
    }

    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  async getStats(coachID?: string) {
    const [total, contacted, scheduled, converted, unresponsive] = await Promise.all([
      this.prisma.lead.count({ where: { coachID } }),
      this.prisma.lead.count({ where: { coachID, status: 'contacted' } }),
      this.prisma.lead.count({ where: { coachID, status: 'scheduled' } }),
      this.prisma.lead.count({ where: { coachID, status: 'converted' } }),
      this.prisma.lead.count({ where: { coachID, status: 'unresponsive' } }),
    ]);

    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    return {
      total,
      contacted,
      scheduled,
      converted,
      unresponsive,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }
}
