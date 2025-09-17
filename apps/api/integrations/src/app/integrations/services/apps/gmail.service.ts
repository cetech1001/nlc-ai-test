import {BadRequestException, Injectable} from "@nestjs/common";
import {
  AppPlatform,
  AuthType,
  EmailAccount,
  Integration,
  IntegrationType,
  OAuthCredentials,
  SyncResult,
  TestResult,
  UserType
} from "@nlc-ai/api-types";
import {BaseIntegrationService} from "../base-integration.service";
import {Prisma} from '@prisma/client';

@Injectable()
export class GmailService extends BaseIntegrationService {
  platformName = AppPlatform.GMAIL;
  integrationType = IntegrationType.APP;
  authType = AuthType.OAUTH;

  async connect(userID: string, userType: UserType, credentials: OAuthCredentials): Promise<Integration> {
    const profile = await this.getEmailProfile(credentials.accessToken);
    try {
      // @ts-ignore
      return await this.prisma.$transaction(async (tx) => {
        const isPrimary = await this.isFirstEmailAccount(userID, userType);

        await this.saveEmailAccount(tx, {
          userID,
          userType: userType,
          provider: 'gmail',
          credentials,
          profileData: profile,
        });

        return tx.integration.create({
          data: {
            userID,
            userType: userType.toString() as UserType,
            integrationType: this.integrationType as IntegrationType,
            platformName: this.platformName,
            accessToken: credentials.accessToken,
            refreshToken: credentials.refreshToken,
            tokenExpiresAt: credentials.tokenExpiresAt,
            config: {
              emailAddress: profile.email,
              name: profile.name,
              picture: profile.picture,
              isPrimary,
            },
            syncSettings: {
              autoSync: true,
              syncFrequency: 'hourly',
              syncEmails: true,
              syncSent: true,
            },
            isActive: true,
          },
        });
      });
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to save gmail integration');
    }
  }

  async test(integration: Integration): Promise<TestResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      const validToken = await this.tokenService.ensureValidToken(integration, accessToken);

      await this.getEmailProfile(validToken);
      return { success: true, message: 'Gmail connection working' };
    } catch (error: any) {
      return { success: false, message: `Gmail test failed: ${error.message}` };
    }
  }

  async sync(integration: Integration): Promise<SyncResult> {
    try {
      const { accessToken } = await this.getDecryptedTokens(integration);
      const validToken = await this.tokenService.ensureValidToken(integration, accessToken);

      const emails = await this.fetchRecentEmails(validToken);
      const threads = await this.fetchEmailThreads(validToken);

      await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          config: {
            ...integration.config,
            emailCount: emails.length,
            threadCount: threads.length,
            lastSync: new Date().toISOString(),
          },
          lastSyncAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Gmail synced successfully',
        data: { emailCount: emails.length, threadCount: threads.length },
      };
    } catch (error: any) {
      return { success: false, message: `Gmail sync failed: ${error.message}` };
    }
  }

  async getAuthUrl(userID: string, userType: UserType): Promise<{ authUrl: string; state: string }> {
    const state = this.stateTokenService.generateState(userID, userType, this.platformName);

    const params = new URLSearchParams({
      client_id: this.configService.get('integrations.oauth.google.clientID', ''),
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ].join(' '),
      redirect_uri: `${this.configService.get('integrations.baseUrl')}/integrations/auth/gmail/callback`,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return {
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      state,
    };
  }

  async handleCallback(userID: string, userType: UserType, code: string, state: string): Promise<Integration> {
    const tokenData = await this.exchangeCodeForToken(code);
    return this.connect(userID, userType, tokenData);
  }

  private async saveEmailAccount(
    tx: Prisma.TransactionClient,
    params: {
      userID: string;
      userType: UserType;
      provider: string;
      credentials: OAuthCredentials;
      profileData: any;
    }
  ): Promise<EmailAccount> {
    const { userID, userType, provider, credentials, profileData } = params;
    const emailAddress = profileData.email;

    const existingAccount = await tx.emailAccount.findFirst({
      where: {
        userID,
        emailAddress,
      },
    });

    const anyConnectedAccount = await tx.emailAccount.findFirst({
      where: {
        userID,
      },
    });

    const accountData = {
      userID,
      userType: userType.toString() as UserType,
      emailAddress,
      provider,
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      tokenExpiresAt: credentials.tokenExpiresAt ?? null,
      isPrimary: !anyConnectedAccount,
      isActive: true,
      syncEnabled: true,
      lastSyncAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    };

    if (existingAccount) {
      const updatedAccount = await tx.emailAccount.update({
        where: { id: existingAccount.id },
        data: {
          ...accountData,
          updatedAt: new Date(),
        },
      });

      return {
        ...updatedAccount,
        accessToken: '***',
        refreshToken: updatedAccount.refreshToken ? '***' : null,
      } as unknown as EmailAccount;
    } else {
      const newAccount = await tx.emailAccount.create({
        data: accountData,
      });

      return {
        ...newAccount,
        accessToken: '***',
        refreshToken: newAccount.refreshToken ? '***' : null,
      } as unknown as EmailAccount;
    }
  }

  private async exchangeCodeForToken(code: string): Promise<OAuthCredentials> {
    const params = new URLSearchParams({
      client_id: this.configService.get('integrations.oauth.google.clientID', ''),
      client_secret: this.configService.get('integrations.oauth.google.clientSecret', ''),
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${this.configService.get('integrations.baseUrl')}/integrations/auth/gmail/callback`,
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokenData: any = await response.json();

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
    };
  }

  private async getEmailProfile(accessToken: string): Promise<any> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    return response.json();
  }

  private async fetchRecentEmails(accessToken: string) {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data: any = await response.json();
    return data.messages || [];
  }

  private async fetchEmailThreads(accessToken: string) {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=50', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data: any = await response.json();
    return data.threads || [];
  }

  override async disconnect(integration: Integration): Promise<void> {
    const emailAddress = (integration as any)?.config?.emailAddress;
    if (!emailAddress) {
      throw new BadRequestException('Integration is missing emailAddress in config');
    }

    const userID = integration.userID;

    await this.prisma.$transaction(async (tx) => {
      // Find the corresponding email account
      const account = await tx.emailAccount.findFirst({
        where: { userID, emailAddress },
      });

      if (!account) {
        // Nothing to remove if the account isn't present
        return;
      }

      const wasPrimary = account.isPrimary ?? false;

      // Delete the email account
      await tx.emailAccount.delete({
        where: { id: account.id },
      });

      // If we removed the primary account, promote another one (if any) to primary
      if (wasPrimary) {
        const another = await tx.emailAccount.findFirst({
          where: { userID },
        });
        if (another) {
          await tx.emailAccount.update({
            where: { id: another.id },
            data: { isPrimary: true },
          });
        }
      }

      await tx.integration.delete({
        where: { id: integration.id }
      });
    });
  }

  private async isFirstEmailAccount(userID: string, userType: UserType): Promise<boolean> {
    const existingAccounts = await this.prisma.integration.count({
      where: { userID, integrationType: 'app', platformName: { in: ['gmail', 'outlook'] } },
    });
    return existingAccounts === 0;
  }
}
