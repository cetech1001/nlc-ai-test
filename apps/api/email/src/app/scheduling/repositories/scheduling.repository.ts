import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';

@Injectable()
export class SchedulingRepository {
  constructor(private prisma: PrismaService) {}

  async getEmailsReadyToSend(limit: number = 50) {
    return this.prisma.emailMessage.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: { lte: new Date() },
      },
      include: {
        coach: { select: { id: true, isActive: true } },
        client: { select: { id: true, isActive: true } },
        lead: { select: { id: true, status: true } },
        emailSequence: { select: { id: true, isActive: true } },
      },
      orderBy: { scheduledFor: 'asc' },
      take: limit,
    });
  }

  async createScheduledEmail(data: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    scheduledFor: Date;
    status: string;
    coachID?: string;
    clientID?: string;
    leadID?: string;
    emailThreadID?: string;
    emailSequenceID?: string;
    sequenceOrder?: number;
    emailTemplateID?: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.emailMessage.create({
      data: {
        to: data.to,
        from: '', // Will be determined during delivery
        subject: data.subject,
        text: data.text,
        html: data.html,
        scheduledFor: data.scheduledFor,
        status: data.status as any,
        coachID: data.coachID,
        clientID: data.clientID,
        leadID: data.leadID,
        emailThreadID: data.emailThreadID,
        emailSequenceID: data.emailSequenceID,
        sequenceOrder: data.sequenceOrder,
        emailTemplateID: data.emailTemplateID,
        metadata: data.metadata || {},
        sentAt: data.scheduledFor, // Will be updated when actually sent
      },
    });
  }

  async updateEmail(emailID: string, updates: {
    status?: string;
    scheduledFor?: Date;
    sentAt?: Date;
    errorMessage?: string | null;
    retryCount?: number;
    metadata?: Record<string, any>;
    providerMessageID?: string;
  }) {
    return this.prisma.emailMessage.update({
      where: { id: emailID },
      data: {
        ...updates,
        ...(updates.status && { status: updates.status as any }),
        updatedAt: new Date(),
      },
    });
  }

  async getEmailByID(emailID: string) {
    return this.prisma.emailMessage.findUnique({
      where: { id: emailID },
      include: {
        coach: { select: { isActive: true } },
        client: { select: { isActive: true } },
        lead: { select: { status: true } },
        emailSequence: { select: { isActive: true } },
        emailThread: { select: { id: true } },
      },
    });
  }

  async updateEmailsByLead(leadID: string, currentStatus: string | string[], updates: any) {
    const whereClause = Array.isArray(currentStatus)
      ? { leadID, status: { in: currentStatus as any[] } }
      : { leadID, status: currentStatus as any };

    return this.prisma.emailMessage.updateMany({
      where: whereClause,
      data: {
        ...updates,
        ...(updates.status && { status: updates.status as any }),
        updatedAt: new Date(),
      },
    });
  }

  async updateEmailsByClient(clientID: string, currentStatus: string | string[], updates: any) {
    const whereClause = Array.isArray(currentStatus)
      ? { clientID, status: { in: currentStatus as any[] } }
      : { clientID, status: currentStatus as any };

    return this.prisma.emailMessage.updateMany({
      where: whereClause,
      data: {
        ...updates,
        ...(updates.status && { status: updates.status as any }),
        updatedAt: new Date(),
      },
    });
  }

  async updateEmailsByCoach(coachID: string, currentStatus: string | string[], updates: any) {
    const whereClause = Array.isArray(currentStatus)
      ? { coachID, status: { in: currentStatus as any[] } }
      : { coachID, status: currentStatus as any };

    return this.prisma.emailMessage.updateMany({
      where: whereClause,
      data: {
        ...updates,
        ...(updates.status && { status: updates.status as any }),
        updatedAt: new Date(),
      },
    });
  }

  async getFailedEmails(coachID?: string, limit: number = 10) {
    const whereClause = {
      status: 'failed' as any,
      updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours only
      ...(coachID && { coachID }),
    };

    return this.prisma.emailMessage.findMany({
      where: whereClause,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async checkRecentDuplicate(email: any): Promise<boolean> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const duplicate = await this.prisma.emailMessage.findFirst({
      where: {
        id: { not: email.id },
        subject: email.subject,
        to: email.to,
        status: 'sent',
        sentAt: { gte: oneDayAgo },
        ...(email.leadID && { leadID: email.leadID }),
        ...(email.clientID && { clientID: email.clientID }),
      },
    });

    return !!duplicate;
  }

  async cleanupOldEmails(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.emailMessage.deleteMany({
      where: {
        status: { in: ['sent', 'failed', 'cancelled'] },
        OR: [
          { sentAt: { lt: cutoffDate } },
          {
            status: { in: ['failed', 'cancelled'] },
            updatedAt: { lt: cutoffDate },
          },
        ],
      },
    });

    return result.count;
  }
}
