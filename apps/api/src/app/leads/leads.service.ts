import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {CreateLeadDto, LeadQueryDto, UpdateLeadDto} from "./dto";

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: LeadQueryDto) {
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
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Status filter
    if (status) {
      where.status = status;
    }

    // Source filter
    if (source) {
      const sources = source.split(',').map(s => s.trim());
      where.source = { in: sources };
    }

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Meeting date range filter
    if (meetingStartDate || meetingEndDate) {
      where.meetingDate = {};
      if (meetingStartDate) where.meetingDate.gte = new Date(meetingStartDate);
      if (meetingEndDate) {
        const end = new Date(meetingEndDate);
        end.setHours(23, 59, 59, 999);
        where.meetingDate.lte = end;
      }
    }

    const [leads, total] = await Promise.all([
      this.prisma.leads.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leads.count({ where }),
    ]);

    return {
      data: leads,
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
    const lead = await this.prisma.leads.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async create(createLeadDto: CreateLeadDto) {
    return this.prisma.leads.create({
      data: {
        ...createLeadDto,
        status: createLeadDto.status || 'contacted',
        meetingDate: createLeadDto.meetingDate ? new Date(createLeadDto.meetingDate) : null,
      },
    });
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    await this.findOne(id);

    return this.prisma.leads.update({
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

    return this.prisma.leads.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    const data: any = {
      status,
      updatedAt: new Date(),
    };

    // If converting to 'converted', set convertedAt
    if (status === 'converted') {
      data.convertedAt = new Date();
    }

    // If contacting, update lastContactedAt
    if (status === 'contacted') {
      data.lastContactedAt = new Date();
    }

    return this.prisma.leads.update({
      where: { id },
      data,
    });
  }

  async getStats() {
    const [total, contacted, scheduled, converted, unresponsive] = await Promise.all([
      this.prisma.leads.count(),
      this.prisma.leads.count({ where: { status: 'contacted' } }),
      this.prisma.leads.count({ where: { status: 'scheduled' } }),
      this.prisma.leads.count({ where: { status: 'converted' } }),
      this.prisma.leads.count({ where: { status: 'unresponsive' } }),
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
