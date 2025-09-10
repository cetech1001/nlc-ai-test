import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';

@Injectable()
export class EmailService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmailMetrics(coachID: string, dateRange: { start: Date; end: Date }) {
    // First, get counts and the provider message IDs of sent scheduled emails for this coach in range
    const [sentEmails, sentScheduledEmails] = await Promise.all([
      this.prisma.scheduledEmail.count({
        where: {
          coachID,
          status: 'sent',
          sentAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      }),
      this.prisma.scheduledEmail.findMany({
        where: {
          coachID,
          status: 'sent',
          sentAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
          // Only rows that have a linked providerMessageID
          providerMessageID: { not: null },
        },
        select: { providerMessageID: true },
      }),
    ]);

    const providerMessageIDs = sentScheduledEmails
      .map((e) => e.providerMessageID as string)
      .filter(Boolean);

    // Now fetch analytics for only those messages
    const analytics = providerMessageIDs.length
      ? await this.prisma.emailMessage.findMany({
          where: {
            providerMessageID: { in: providerMessageIDs },
          },
          select: { metadata: true },
        })
      : [];

    let opened = 0;
    let clicked = 0;
    let bounced = 0;
    let complained = 0;

    analytics.forEach((email) => {
      const data = email.metadata as any;
      if (data?.analytics) {
        if (data.analytics.opened) opened++;
        if (data.analytics.clicked) clicked++;
        if (data.analytics.bounced) bounced++;
        if (data.analytics.complained) complained++;
      }
    });

    return {
      totalSent: sentEmails,
      opened,
      clicked,
      bounced,
      complained,
      openRate: sentEmails > 0 ? (opened / sentEmails) * 100 : 0,
      clickRate: sentEmails > 0 ? (clicked / sentEmails) * 100 : 0,
      bounceRate: sentEmails > 0 ? (bounced / sentEmails) * 100 : 0,
      complaintRate: sentEmails > 0 ? (complained / sentEmails) * 100 : 0,
    };
  }

  async getTemplatePerformance(coachID: string, dateRange: { start: Date; end: Date }) {
    const templates = await this.prisma.emailTemplate.findMany({
      where: {
        coachID,
        isActive: true,
        lastUsedAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
        usageCount: true,
        lastUsedAt: true,
      },
      orderBy: { usageCount: 'desc' },
      take: 10,
    });

    return { templates };
  }

  async getSequencePerformance(coachID: string, dateRange: { start: Date; end: Date }) {
    const sequences = await this.prisma.emailSequence.findMany({
      where: {
        coachID,
        isActive: true,
        createdAt: {
          lte: dateRange.end,
        },
      },
      include: {
        _count: {
          select: {
            scheduledEmails: {
              where: {
                sentAt: {
                  gte: dateRange.start,
                  lte: dateRange.end,
                },
              },
            },
          },
        },
        scheduledEmails: {
          where: {
            status: 'sent',
            sentAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      sequences: sequences.map((seq) => ({
        id: seq.id,
        name: seq.name,
        totalEmails: seq._count.scheduledEmails,
        emailsSent: seq.scheduledEmails.length,
        isActive: seq.isActive,
      })),
    };
  }

  async getEngagementTrends(coachID: string, days: number = 30) {
    const dateRange = {
      start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      end: new Date(),
    };

    // This would need more sophisticated date grouping in a real implementation
    const dailyStats = await this.prisma.scheduledEmail.groupBy({
      by: ['sentAt'],
      where: {
        coachID,
        status: 'sent',
        sentAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      _count: {
        sentAt: true,
      },
      orderBy: {
        sentAt: 'asc',
      },
    });

    return {
      period: { days, start: dateRange.start, end: dateRange.end },
      dailyStats: dailyStats.map((stat) => ({
        date: stat.sentAt,
        emailsSent: stat._count.sentAt,
      })),
    };
  }
}
