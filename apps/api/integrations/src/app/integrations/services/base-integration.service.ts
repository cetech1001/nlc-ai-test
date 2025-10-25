import { Injectable } from "@nestjs/common";
import {
  AuthType,
  CreateIntegrationData,
  Integration,
  IntegrationEvent,
  IntegrationProvider,
  IntegrationType,
  SyncResult,
  TestResult
} from "@nlc-ai/types";
import { PrismaService } from "@nlc-ai/api-database";
import { OutboxService } from "@nlc-ai/api-messaging";
import { TokenManagementService } from "./token-management.service";
import { EncryptionService } from "./encryption.service";
import { ConfigService } from "@nestjs/config";
import { StateTokenService } from "./state-token.service";

@Injectable()
export abstract class BaseIntegrationService implements IntegrationProvider {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly encryption: EncryptionService,
    protected readonly token: TokenManagementService,
    protected readonly stateToken: StateTokenService,
    protected readonly config: ConfigService,
    protected readonly outbox: OutboxService,
  ) {}

  abstract platformName: string;
  abstract integrationType: IntegrationType;
  abstract authType: AuthType;

  abstract connect(userID: string, userType: string, credentials: any): Promise<Integration>;
  abstract test(integration: Integration): Promise<TestResult>;
  abstract sync(integration: Integration): Promise<SyncResult>;

  abstract getAuthUrl?(userID: string, userType: string): Promise<{ authUrl: string; state: string }>;
  abstract handleCallback?(userID: string, userType: string, code: string, state: string): Promise<Integration>;

  async refreshToken?(integration: Integration): Promise<string> {
    return this.token.ensureValidToken(integration, '');
  }

  async disconnect(integration: Integration): Promise<void> {
    await this.prisma.integration.delete({
      where: { id: integration.id }
    });

    await this.outbox.saveAndPublishEvent<IntegrationEvent>(
      {
        eventType: 'integration.disconnected',
        payload: {
          integrationID: integration.id,
          userID: integration.userID,
          userType: integration.userType,
          platformName: integration.platformName,
          integrationType: integration.integrationType,
          disconnectedAt: new Date().toISOString(),
        },
        schemaVersion: 1,
      },
      'integration.disconnected'
    );
  }

  protected async saveIntegration(data: CreateIntegrationData): Promise<Integration> {
    const encryptedToken = await this.encryption.encrypt(data.accessToken);
    const encryptedRefreshToken = data.refreshToken
      ? await this.encryption.encrypt(data.refreshToken)
      : null;

    const integration = await this.prisma.integration.create({
      data: {
        ...data,
        accessToken: encryptedToken,
        refreshToken: encryptedRefreshToken,
      }
    });

    return { ...integration, integrationType: integration.integrationType as IntegrationType };
  }

  protected async getDecryptedTokens(integration: Integration): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> {
    const accessToken = await this.encryption.decrypt(integration.accessToken || '');
    const refreshToken = integration.refreshToken
      ? await this.encryption.decrypt(integration.refreshToken)
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
    const encryptedAccessToken = await this.encryption.encrypt(accessToken);
    const encryptedRefreshToken = refreshToken
      ? await this.encryption.encrypt(refreshToken)
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
