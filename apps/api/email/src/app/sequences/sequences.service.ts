import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import {AuthUser, CreateEmailSequenceRequest, EmailSequenceStatus, UpdateEmailSequenceRequest} from "@nlc-ai/types";

@Injectable()
export class SequencesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createSequence(user: AuthUser, sequenceData: CreateEmailSequenceRequest) {
    const sequence = await this.prisma.emailSequence.create({
      data: {
        ...sequenceData,
        userID: user.id,
        userType: user.type,
        sequence: [],
        status: EmailSequenceStatus.ACTIVE,
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
    updateData: UpdateEmailSequenceRequest
  ) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: { id: sequenceID, coachID },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    const updatedSequence = await this.prisma.emailSequence.update({
      where: { id: sequenceID },
      data: updateData,
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
}
