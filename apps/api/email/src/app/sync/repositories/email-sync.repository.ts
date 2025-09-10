import { Injectable } from '@nestjs/common';
import {PrismaService} from "@nlc-ai/api-database";
import {UserType} from "@nlc-ai/types";

@Injectable()
export class EmailSyncRepository {
  constructor(private prisma: PrismaService) {}

  async getAccountsByUser(userID: string, userType: UserType) {
    return this.prisma.emailAccount.findMany({
      where: {
        userID,
        userType,
        isActive: true,
        syncEnabled: true,
      },
    });
  }

  async getAccountByID(accountID: string) {
    return this.prisma.emailAccount.findUnique({
      where: { id: accountID },
    });
  }

  async updateLastSync(accountID: string, lastSyncAt: Date) {
    return this.prisma.emailAccount.update({
      where: { id: accountID },
      data: { lastSyncAt },
    });
  }

  async createSyncResult(result: any) {
    // You'd create a sync result record here
    // For now, just log it
    console.log('Sync result:', result);
  }
}
