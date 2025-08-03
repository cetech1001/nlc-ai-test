import { Injectable } from "@nestjs/common";
import { CreateIntegrationData, Integration, IntegrationProvider, SyncResult, TestResult } from "@nlc-ai/types";
import { PrismaService } from "../../prisma/prisma.service";
import { TokenManagementService } from "./token-management.service";
import { EncryptionService } from "./encryption.service";
import { ConfigService } from "@nestjs/config";
import { StateTokenService } from "./state-token.service";

@Injectable()
export abstract class BaseIntegrationService implements IntegrationProvider {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly encryptionService: EncryptionService,
    protected readonly tokenService: TokenManagementService,
    protected readonly stateTokenService: StateTokenService,
    protected readonly configService: ConfigService,
  ) {}

  abstract platformName: string;
  abstract integrationType: 'social' | 'course' | 'app';
  abstract authType: 'oauth' | 'api_key' | 'webhook';

  abstract connect(coachID: string, credentials: any): Promise<Integration>;
  abstract test(integration: Integration): Promise<TestResult>;
  abstract sync(integration: Integration): Promise<SyncResult>;

  abstract getAuthUrl?(coachID: string): Promise<{ authUrl: string; state: string }>;
  abstract handleCallback?(coachID: string, code: string, state: string): Promise<Integration>;

  async refreshToken?(integration: Integration): Promise<string> {
    return this.tokenService.ensureValidToken(integration, '');
  }

  async disconnect(integration: Integration): Promise<void> {
    await this.prisma.integration.delete({
      where: { id: integration.id }
    });
  }

  protected async saveIntegration(data: CreateIntegrationData): Promise<Integration> {
    const encryptedToken = await this.encryptionService.encrypt(data.accessToken);
    const encryptedRefreshToken = data.refreshToken
      ? await this.encryptionService.encrypt(data.refreshToken)
      : null;

    return this.prisma.integration.create({
      data: {
        ...data,
        accessToken: encryptedToken,
        refreshToken: encryptedRefreshToken,
      }
    });
  }

  protected async getDecryptedTokens(integration: Integration): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> {
    const accessToken = await this.encryptionService.decrypt(integration.accessToken || '');
    const refreshToken = integration.refreshToken
      ? await this.encryptionService.decrypt(integration.refreshToken)
      : undefined;

    return { accessToken, refreshToken };
  }

  protected async updateIntegrationConfig(integrationID: string, config: any): Promise<void> {
    await this.prisma.integration.update({
      where: { id: integrationID },
      data: {
        config,
        lastSyncAt: new Date(),
      },
    });
  }

  protected async updateIntegrationTokens(
    integrationID: string,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
  ): Promise<void> {
    const encryptedAccessToken = await this.encryptionService.encrypt(accessToken);
    const encryptedRefreshToken = refreshToken
      ? await this.encryptionService.encrypt(refreshToken)
      : undefined;

    await this.prisma.integration.update({
      where: { id: integrationID },
      data: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: expiresAt,
      },
    });
  }
}
