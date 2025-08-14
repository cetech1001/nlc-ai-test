import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { EmailIntegrationService } from '../email/email-integration.service';

@Injectable()
export class SequencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailIntegrationService: EmailIntegrationService,
  ) {}

  async createSequence(coachID: string, sequenceData: {
    name: string;
    description?: string;
    category: string;
    triggerType: string;
    isActive?: boolean;
    emails: Array<{
      templateID: string;
      delayDays: number;
      order: number;
    }>;
  }) {
    const sequence = await this.prisma.emailSequence.create({
      data: {
        coachID,
        name: sequenceData.name,
        description: sequenceData.description,
        category: sequenceData.category,
        triggerType: sequenceData.triggerType,
        isActive: sequenceData.isActive ?? true,
        totalEmails: sequenceData.emails.length,
        metadata: JSON.stringify({ emails: sequenceData.emails }),
      },
    });

    return { sequence };
  }

  async getSequences(coachID: string, filters?: {
    category?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const where: any = { coachID };

    if (filters?.category) where.category = filters.category;
    if (typeof filters?.isActive === 'boolean') where.isActive = filters.isActive;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const sequences = await this.prisma.emailSequence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return { sequences };
  }

  async getSequence(coachID: string, sequenceID: string) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: { id: sequenceID, coachID },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    return { sequence };
  }

  async updateSequence(
    coachID: string,
    sequenceID: string,
    updateData: {
      name?: string;
      description?: string;
      isActive?: boolean;
      emails?: Array<{
        templateID: string;
        delayDays: number;
        order: number;
      }>;
    }
  ) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: { id: sequenceID, coachID },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    const updatedData: any = { ...updateData };

    if (updateData.emails) {
      updatedData.totalEmails = updateData.emails.length;
      updatedData.metadata = JSON.stringify({ emails: updateData.emails });
    }

    const updatedSequence = await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: updatedData,
    });

    return { sequence: updatedSequence };
  }

  async deleteSequence(coachID: string, sequenceID: string) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: { id: sequenceID, coachID },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: { isActive: false },
    });

    return { message: 'Sequence deleted successfully' };
  }

  async startSequenceForLead(
    coachID: string,
    leadID: string,
    sequenceID: string
  ) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: { id: sequenceID, coachID, isActive: true },
    });

    if (!sequence) {
      throw new NotFoundException('Active sequence not found');
    }

    const lead = await this.prisma.lead.findUnique({
      where: { id: leadID },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const sequenceEmails = JSON.parse(sequence.metadata as string).emails;

    for (const emailConfig of sequenceEmails) {
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + emailConfig.delayDays);

      await this.emailIntegrationService.sendLeadFollowupWithTemplate({
        leadID,
        coachID,
        templateID: emailConfig.templateID,
        scheduledFor,
        sequenceOrder: emailConfig.order,
        emailSequenceID: sequenceID,
      });
    }

    return { message: 'Sequence started successfully' };
  }
}
