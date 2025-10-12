import { BadRequestException, Injectable } from '@nestjs/common';
import { EmailAccountActionResponse } from '@nlc-ai/api-types';
import {
  EmailAccount,
  UserType,
  EmailAccountProvider
} from '@nlc-ai/types';
import { AccountsRepository } from './repositories/accounts.repository';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountsRepo: AccountsRepository,
  ) {}

  async getEmailAccounts(userID: string): Promise<EmailAccount[]> {
    try {
      const emailAccounts = await this.accountsRepo.getAccountsByUser(userID);

      return emailAccounts.map(account => ({
        ...account,
        userType: account.userType as UserType,
        provider: account.provider as EmailAccountProvider,
        accessToken: account.accessToken ? '***' : null,
        refreshToken: account.refreshToken ? '***' : null,
      }));
    } catch (error: any) {
      throw new BadRequestException('Failed to retrieve email accounts');
    }
  }

  async hasAnAccount(userID: string): Promise<{ exists: boolean; }> {
    const accounts = await this.accountsRepo.hasAnAccount(userID);
    return { exists: accounts > 0 };
  }

  async setPrimaryEmailAccount(accountID: string, userID: string): Promise<EmailAccountActionResponse> {
    const emailAccount = await this.accountsRepo.getAccountByID(accountID, userID);

    if (!emailAccount) {
      throw new BadRequestException('Email account not found');
    }

    try {
      await this.accountsRepo.setPrimaryEmailAccount(accountID, userID);

      return {
        success: true,
        message: `${emailAccount.emailAddress} set as primary email account`,
      };
    } catch (error: any) {
      throw new BadRequestException('Failed to set primary email account');
    }
  }

  async getAccountStatus(accountID: string, userID: string) {
    const account = await this.accountsRepo.getAccountByID(accountID, userID);

    if (!account) {
      throw new BadRequestException('Email account not found');
    }

    return {
      accountID: account.id,
      emailAddress: account.emailAddress,
      provider: account.provider,
      isActive: account.isActive,
      syncEnabled: account.syncEnabled,
      isPrimary: account.isPrimary,
      needsReauthentication: account.syncEnabled === false && account.accessToken === null,
      lastSyncAt: account.lastSyncAt,
    };
  }
}
