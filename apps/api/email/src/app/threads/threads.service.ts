import {BadRequestException, Injectable} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {UserType} from "@nlc-ai/types";

interface ThreadFilters {
  limit?: number;
  status?: string;
  isRead?: boolean;
  clientID?: string;
}

@Injectable()
export class ThreadsService {
  constructor(private readonly prisma: PrismaService) {}

  async getThreads(userID: string, filters: ThreadFilters = {}) {
    const { limit = 20, status, isRead, clientID } = filters;

    const threads = await this.prisma.emailThread.findMany({
      where: {
        userID,
        ...(status && { status }),
        ...(isRead !== undefined && { isRead }),
        ...(clientID && { clientID }),
      },
      include: {
        _count: {
          select: { emailMessages: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
    });

    const unreadCount = await this.prisma.emailThread.count({
      where: { userID, isRead: false },
    });

    return {
      threads,
      unreadCount,
      total: threads.length,
    };
  }

  async getThread(userID: string, threadID: string) {
    const thread = await this.prisma.emailThread.findFirst({
      where: { id: threadID, userID },
      include: {
        emailMessages: {
          orderBy: { sentAt: 'asc' },
          take: 50,
        },
      },
    });

    if (!thread) {
      throw new BadRequestException('Thread not found');
    }

    if (!thread.isRead) {
      await this.prisma.emailThread.update({
        where: { id: threadID },
        data: { isRead: true },
      });
    }

    return thread;
  }

  async replyToThread(userID: string, threadID: string, replyData: {
    text?: string;
    html?: string;
    subject?: string;
  }) {
    const thread = await this.prisma.emailThread.findFirst({
      where: { id: threadID, userID },
    });

    if (!thread) {
      throw new BadRequestException('Thread not found');
    }

    const primaryAccount = await this.prisma.emailAccount.findFirst({
      where: { userID: userID, isPrimary: true },
    });

    if (!primaryAccount) {
      throw new BadRequestException('No primary email account found');
    }

    const clientEmail = await this.getClientEmail(thread.clientID, thread.clientType as UserType);

    const message = await this.prisma.emailMessage.create({
      data: {
        emailThreadID: threadID,
        from: primaryAccount.emailAddress,
        to: clientEmail,
        subject: replyData.subject || `Re: ${thread.subject}`,
        text: replyData.text,
        html: replyData.html,
        status: 'pending',
        sentAt: new Date(),
        aiProcessed: false,
        suggestedActions: [],
      },
    });

    await this.prisma.emailThread.update({
      where: { id: threadID },
      data: {
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
      },
    });

    return {
      message: 'Reply queued for delivery',
      messageID: message.id,
      threadID,
    };
  }

  async updateThread(userID: string, threadID: string, updates: {
    isRead?: boolean;
    status?: string;
    priority?: string;
    tags?: string[];
  }) {
    const thread = await this.prisma.emailThread.findFirst({
      where: { id: threadID, userID },
    });

    if (!thread) {
      throw new BadRequestException('Thread not found');
    }

    const updatedThread = await this.prisma.emailThread.update({
      where: { id: threadID },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    return { message: 'Thread updated successfully', thread: updatedThread };
  }

  private async getClientEmail(clientID: string, clientType: UserType) {
    let client;

    if (clientType === UserType.CLIENT) {
      client = await this.prisma.client.findUnique({
        where: { id: clientID }
      });
    } else if (clientType === UserType.COACH) {
      client = await this.prisma.coach.findUnique({
        where: { id: clientID }
      });
    }

    return client?.email || '';
  }
}
