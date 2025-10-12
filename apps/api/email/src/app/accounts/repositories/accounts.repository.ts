import { Injectable } from '@nestjs/common';
import { PrismaService } from "@nlc-ai/api-database";

@Injectable()
export class AccountsRepository {
  constructor(private prisma: PrismaService) {}

  async getAccountsByUser(userID: string) {
    return this.prisma.emailAccount.findMany({
      where: {
        userID,
        isActive: true,
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
}
