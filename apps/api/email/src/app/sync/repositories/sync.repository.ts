import {Injectable} from '@nestjs/common';
import {PrismaService} from '@nlc-ai/api-database';
import {EmailParticipantType, EmailThreadStatus, UserType} from '@nlc-ai/types';

@Injectable()
export class SyncRepository {
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

  async getAllActiveAccounts(coachID?: string) {
    return this.prisma.emailAccount.findMany({
      where: {
        userID: coachID,
        isActive: true,
        syncEnabled: true,
      },
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

  async updateLastSyncAndStatus(
    accountID: string,
    lastSyncAt: Date,
    isActive: boolean,
    lastSyncToken?: string | null,
    lastHistoryID?: string
  ) {
    return this.prisma.emailAccount.update({
      where: { id: accountID },
      data: {
        lastSyncAt,
        isActive,
        syncEnabled: true,
        ...(lastSyncToken && { lastSyncToken }),
        ...(lastHistoryID && { lastHistoryID }),
        updatedAt: new Date(),
      },
    });
  }

  async updateTokens(accountID: string, tokens: {
    accessToken: string;
    refreshToken?: string | null;
    tokenExpiresAt?: Date | null;
  }) {
    return this.prisma.emailAccount.update({
      where: { id: accountID },
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.tokenExpiresAt,
        isActive: true,
        syncEnabled: true,
        updatedAt: new Date(),
      },
    });
  }

  async markAccountAsNeedingReauth(accountID: string) {
    return this.prisma.emailAccount.update({
      where: { id: accountID },
      data: {
        syncEnabled: false,
        accessToken: null,
        tokenExpiresAt: null,
        updatedAt: new Date(),
      },
    });
  }

  async getAccountsNeedingReauth(userID?: string) {
    return this.prisma.emailAccount.findMany({
      where: {
        ...(userID && { userID }),
        isActive: true,
        syncEnabled: false,
        accessToken: null,
      },
    });
  }

  async createSyncResult(result: {
    accountID: string;
    emailsProcessed?: number;
    newEmails?: number;
    status: string;
    error?: string;
  }) {
    console.log('Sync result:', {
      ...result,
      timestamp: new Date().toISOString(),
    });
  }

  async findClientByEmail(email: string, coachID: string) {
    let client;
    let type: EmailParticipantType = EmailParticipantType.CLIENT;

    client = await this.prisma.client.findFirst({
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

    if (!client) {
      client = await this.prisma.lead.findFirst({
        where: { email }
      });
      type = EmailParticipantType.LEAD;
    }

    if (!client) {
      client = await this.prisma.coach.findFirst({
        where: { email }
      });
      type = EmailParticipantType.COACH;
    }

    if (client) {
      return {
        id: client.id,
        name: (client as any).name || (client as any).firstName + ' ' + (client as any).lastName,
        type,
      };
    }
    return null;
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

  async findOrCreateEmailThread(params: {
    userID: string;
    userType: UserType;
    participantID: string;
    participantType: EmailParticipantType;
    participantName: string;
    participantEmail: string;
    emailAccountID: string;
    threadID: string;
    subject: string;
    lastMessageAt: Date;
    lastMessageFrom: string;
    lastMessageFromEmail: string;
    lastMessagePreview: string;
    isRead: boolean;
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
          userID: params.userID,
          userType: params.userType,
          participantID: params.participantID,
          participantType: params.participantType,
          participantName: params.participantName,
          participantEmail: params.participantEmail,
          emailAccountID: params.emailAccountID,
          threadID: params.threadID,
          subject: params.subject,
          status: EmailThreadStatus.ACTIVE,
          isRead: params.isRead,
          priority: 'normal',
          messageCount: 1,
          lastMessageAt: params.lastMessageAt,
          lastMessageFrom: params.lastMessageFrom,
          lastMessageFromEmail: params.lastMessageFromEmail,
          lastMessagePreview: params.lastMessagePreview,
          participants: [],
        },
      });
    } else {
      thread = await this.prisma.emailThread.update({
        where: { id: thread.id },
        data: {
          lastMessageAt: params.lastMessageAt,
          lastMessageFrom: params.lastMessageFrom,
          lastMessageFromEmail: params.lastMessageFromEmail,
          lastMessagePreview: params.lastMessagePreview,
          isRead: params.isRead,
          messageCount: { increment: 1 },
        },
      });
    }

    return thread;
  }

  async getSyncStats(userID: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [unreadThreads, totalThreadsToday, lastSync, accountsNeedingReauth] = await Promise.all([
      this.prisma.emailThread.count({
        where: { userID, isRead: false }
      }),
      this.prisma.emailThread.count({
        where: { userID, createdAt: { gte: today } }
      }),
      this.prisma.emailAccount.findFirst({
        where: { userID, isActive: true },
        select: { lastSyncAt: true },
        orderBy: { lastSyncAt: 'desc' }
      }),
      this.getAccountsNeedingReauth(userID),
    ]);

    return {
      unreadThreads,
      totalThreadsToday,
      lastSyncAt: lastSync?.lastSyncAt,
      accountsNeedingReauth: accountsNeedingReauth.length,
      needsReauthentication: accountsNeedingReauth.length > 0,
    };
  }
}
