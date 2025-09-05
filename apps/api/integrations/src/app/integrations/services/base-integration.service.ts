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
} from "@nlc-ai/api-types";
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
    protected readonly encryptionService: EncryptionService,
    protected readonly tokenService: TokenManagementService,
    protected readonly stateTokenService: StateTokenService,
    protected readonly configService: ConfigService,
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
    return this.tokenService.ensureValidToken(integration, '');
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
    let encryptedToken, encryptedRefreshToken;
    try {
      encryptedToken = await this.encryptionService.encrypt(data.accessToken);
      encryptedRefreshToken = data.refreshToken
        ? await this.encryptionService.encrypt(data.refreshToken)
        : null;
    } catch (e: any) {
      throw e;
    }

    const integration = await this.prisma.integration.create({
      data: {
        ...data,
        accessToken: encryptedToken,
        refreshToken: encryptedRefreshToken,
      }
    });

    await this.outbox.saveAndPublishEvent<IntegrationEvent>(
      {
        eventType: 'integration.connected',
        payload: {
          integrationID: integration.id,
          userID: integration.userID,
          userType: integration.userType,
          platformName: integration.platformName,
          integrationType: integration.integrationType,
          connectedAt: new Date().toISOString(),
        },
        schemaVersion: 1,
      },
      'integration.connected'
    );

    return { ...integration, integrationType: integration.integrationType as IntegrationType };
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
