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

  async hasAnAccount(userID: string) {
    return this.prisma.emailAccount.count({
      where: {
        userID,
        isActive: true,
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

  /**
   * Update last sync time and account status
   */
  async updateLastSyncAndStatus(accountID: string, lastSyncAt: Date, isActive: boolean) {
    return this.prisma.emailAccount.update({
      where: { id: accountID },
      data: {
        lastSyncAt,
        isActive,
        syncEnabled: true,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Update access token and expiry time
   */
  async updateTokens(accountID: string, tokens: {
    accessToken: string;
    refreshToken?: string;
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

  /**
   * Mark account as needing re-authentication
   */
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

  /**
   * Get accounts that need token refresh (expired or expiring soon)
   */
  async getAccountsNeedingTokenRefresh() {
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

    return this.prisma.emailAccount.findMany({
      where: {
        isActive: true,
        syncEnabled: true,
        refreshToken: { not: null },
        OR: [
          { tokenExpiresAt: null },
          { tokenExpiresAt: { lte: fiveMinutesFromNow } },
        ],
      },
    });
  }

  /**
   * Get accounts that are marked as needing re-authentication
   */
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
    // For now just log the result, but you could store this in a sync_results table
    console.log('Sync result:', {
      ...result,
      timestamp: new Date().toISOString(),
    });

    // Optional: Create a sync log entry if you have a sync_logs table
    // return this.prisma.emailSyncLog.create({
    //   data: {
    //     accountID: result.accountID,
    //     emailsProcessed: result.emailsProcessed || 0,
    //     newEmails: result.newEmails || 0,
    //     status: result.status,
    //     error: result.error,
    //     syncedAt: new Date(),
    //   },
    // });
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
