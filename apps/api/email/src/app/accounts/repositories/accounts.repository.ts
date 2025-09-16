import { Injectable } from '@nestjs/common';
import { PrismaService } from "@nlc-ai/api-database";
import {EmailMessageStatus, EmailThreadStatus, UserType} from "@nlc-ai/types";

@Injectable()
export class AccountsRepository {
  constructor(private prisma: PrismaService) {}

  async getAccountsByUser(userID: string) {
    return this.prisma.emailAccount.findMany({
      where: {
        userID,
        isActive: true,
        syncEnabled: true,
      },
    });
  }

  async getAllActiveAccounts() {
    return this.prisma.emailAccount.findMany({
      where: {
        isActive: true,
        syncEnabled: true,
      },
    });
  }

  async setPrimaryEmailAccount(accountID: string, userID: string) {
    return this.prisma.$transaction(async (prisma) => {
      await prisma.emailAccount.updateMany({
        where: {
          userID,
          id: { not: accountID },
        },
        data: { isPrimary: false },
      });

      await prisma.emailAccount.update({
        where: { id: accountID },
        data: { isPrimary: true },
      });
    });
  }

  async getAccountByID(accountID: string, userID?: string) {
    return this.prisma.emailAccount.findUnique({
      where: {
        id: accountID,
        ...(userID && { userID }),
      },
    });
  }

  async updateLastSync(accountID: string, lastSyncAt: Date) {
    return this.prisma.emailAccount.update({
      where: { id: accountID },
      data: { lastSyncAt },
    });
  }

  async createSyncResult(result: {
    accountID: string;
    emailsProcessed?: number;
    newEmails?: number;
    status: string;
    error?: string;
  }) {
    console.log('Sync result:', result);
  }

  async findClientByEmail(email: string, coachID: string) {
    return this.prisma.client.findFirst({
      where: {
        email,
        clientCoaches: {
          some: {
            coachID,
            status: 'active',
          },
        },
      },
    });
  }

  async getCoachEmails(coachID: string): Promise<string[]> {
    const [coach, accounts] = await Promise.all([
      this.prisma.coach.findUnique({
        where: { id: coachID },
        select: { email: true },
      }),
      this.prisma.emailAccount.findMany({
        where: { userID: coachID },
        select: { emailAddress: true },
      }),
    ]);

    return [
      ...(coach?.email ? [coach.email] : []),
      ...accounts.map(acc => acc.emailAddress),
    ];
  }

  async threadExists(threadID: string): Promise<boolean> {
    const count = await this.prisma.emailThread.count({
      where: { threadID },
    });
    return count > 0;
  }

  async findOrCreateEmailThread(params: {
    userID: string;
    userType: UserType;
    clientID: string;
    clientType: UserType;
    emailAccountID: string;
    threadID: string;
    subject: string;
  }) {
    let thread = await this.prisma.emailThread.findFirst({
      where: {
        userID: params.userID,
        threadID: params.threadID,
      },
    });

    if (!thread) {
      thread = await this.prisma.emailThread.create({
        data: {
          ...params,
          status: EmailThreadStatus.ACTIVE,
          isRead: false,
          priority: 'normal',
          messageCount: 0,
          lastMessageAt: new Date(),
          participants: [],
          tags: [],
        },
      });
    }

    return thread;
  }

  async createEmailMessage(data: {
    threadID: string;
    providerMessageID: string;
    from: string;
    to: string;
    subject?: string;
    text?: string;
    html?: string;
    sentAt: Date;
    receivedAt: Date;
    isRead?: boolean;
  }) {
    const existing = await this.prisma.emailMessage.findFirst({
      where: {
        emailThreadID: data.threadID,
        providerMessageID: data.providerMessageID,
      },
    });

    if (existing) return existing;

    return this.prisma.emailMessage.create({
      data: {
        emailThreadID: data.threadID,
        providerMessageID: data.providerMessageID,
        from: data.from,
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html,
        sentAt: data.sentAt,
        receivedAt: data.receivedAt,
        status: EmailMessageStatus.DELIVERED,
        aiProcessed: false,
        suggestedActions: [],
      },
    });
  }
}
