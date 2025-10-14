import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';

interface CreateEmailCacheParams {
  coachID: string;
  threadID: string;
  messageID: string;
  s3Key: string;
  from: string;
  to: string;
  subject?: string;
  isFromCoach: boolean;
  isToClientOrLead: boolean;
  sentAt: Date;
}

@Injectable()
export class EmailCacheRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEmailCache(params: CreateEmailCacheParams) {
    return this.prisma.coachEmailCache.create({
      data: params,
    });
  }

  async getCoachSentEmails(coachID: string, limit?: number) {
    return this.prisma.coachEmailCache.findMany({
      where: {
        coachID,
        isFromCoach: true,
        isToClientOrLead: true,
      },
      orderBy: { sentAt: 'asc' },
      ...(limit && { take: limit }),
    });
  }

  async getUnprocessedEmails(coachID: string, minCount: number = 50) {
    const count = await this.prisma.coachEmailCache.count({
      where: {
        coachID,
        isFromCoach: true,
        isToClientOrLead: true,
        includedInFineTuning: false,
      },
    });

    if (count < minCount) {
      return null;
    }

    return this.prisma.coachEmailCache.findMany({
      where: {
        coachID,
        isFromCoach: true,
        isToClientOrLead: true,
        includedInFineTuning: false,
      },
      orderBy: { sentAt: 'asc' },
    });
  }

  async markEmailsAsProcessed(emailIDs: string[], fineTuningJobID: string) {
    return this.prisma.coachEmailCache.updateMany({
      where: {
        id: { in: emailIDs },
      },
      data: {
        includedInFineTuning: true,
        fineTuningJobID,
      },
    });
  }

  async getEmailsByThread(coachID: string, threadID: string) {
    return this.prisma.coachEmailCache.findMany({
      where: {
        coachID,
        threadID,
      },
      orderBy: { sentAt: 'asc' },
    });
  }

  async getEmailCacheStats(coachID: string) {
    const [total, fromCoach, notProcessed, lastEmail] = await Promise.all([
      this.prisma.coachEmailCache.count({
        where: { coachID },
      }),
      this.prisma.coachEmailCache.count({
        where: { coachID, isFromCoach: true },
      }),
      this.prisma.coachEmailCache.count({
        where: {
          coachID,
          isFromCoach: true,
          includedInFineTuning: false,
        },
      }),
      this.prisma.coachEmailCache.findFirst({
        where: { coachID, isFromCoach: true },
        orderBy: { sentAt: 'desc' },
        select: { sentAt: true },
      }),
    ]);

    return {
      totalEmails: total,
      sentByCoach: fromCoach,
      readyForTraining: notProcessed,
      lastEmailDate: lastEmail?.sentAt,
    };
  }

  async emailExists(coachID: string, messageID: string): Promise<boolean> {
    const count = await this.prisma.coachEmailCache.count({
      where: { coachID, messageID },
    });
    return count > 0;
  }

  async getEmailsByDateRange(
    coachID: string,
    startDate: Date,
    endDate: Date
  ) {
    return this.prisma.coachEmailCache.findMany({
      where: {
        coachID,
        isFromCoach: true,
        isToClientOrLead: true,
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { sentAt: 'asc' },
    });
  }
}
