
import { PrismaService } from '@nlc-ai/api-database';
import { Integration, IntegrationType, UserType } from '@nlc-ai/api-types';
import {Injectable, NotFoundException} from "@nestjs/common";

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllIntegrations(userID: string, userType: UserType) {
    return this.prisma.integration.findMany({
      where: {
        userID,
        userType
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getIntegrationByPlatform(userID: string, userType: UserType, platform: string) {
    const integration = await this.prisma.integration.findFirst({
      where: {
        userID,
        userType,
        platformName: platform,
      },
    });

    if (!integration) {
      return { isConnected: false };
    }

    return {
      isConnected: true,
      ...(integration.config as any),
      accessToken: integration.accessToken,
      lastSync: integration.lastSyncAt,
    };
  }

  async getSocialIntegrations(userID: string, userType: UserType) {
    return this.prisma.integration.findMany({
      where: {
        userID,
        userType,
        integrationType: 'social'
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPublicSocialIntegrations(userID: string, userType: UserType) {
    const integrations = await this.prisma.integration.findMany({
      where: {
        userID,
        userType,
        integrationType: 'social',
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter to only show integrations where showOnProfile is true
    // Return minimal data for public display
    return integrations
      .filter(integration => {
        const config = integration.config as any;
        return config?.showOnProfile !== false; // Show by default if not set
      })
      .map(integration => ({
        id: integration.id,
        platformName: integration.platformName,
        config: {
          username: (integration.config as any)?.username,
          name: (integration.config as any)?.name,
          displayName: (integration.config as any)?.displayName,
          profileUrl: (integration.config as any)?.profileUrl || `https://youtube.com/${(integration.config as any)?.snippet?.customUrl}`,
          followerCount: (integration.config as any)?.followerCount,
        },
      }));
  }

  async getAppIntegrations(userID: string, userType: UserType) {
    return this.prisma.integration.findMany({
      where: {
        userID,
        userType,
        integrationType: 'app'
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCalendlyIntegration(userID: string, userType: UserType) {
    const integration = await this.prisma.integration.findFirst({
      where: {
        userID,
        userType,
        platformName: 'calendly'
      },
    });

    if (!integration) {
      throw new NotFoundException('Calendly integration not found');
    }

    return integration;
  }

  async findUserIntegration(userID: string, userType: UserType, integrationID: string): Promise<Integration> {
    const integration = await this.prisma.integration.findFirst({
      where: {
        id: integrationID,
        userID,
        userType
      },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return { ...integration, integrationType: integration.integrationType as IntegrationType };
  }

  async updateProfileVisibility(integrationID: string, showOnProfile: boolean): Promise<void> {
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationID },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const currentConfig = (integration.config as any) || {};

    await this.prisma.integration.update({
      where: { id: integrationID },
      data: {
        config: {
          ...currentConfig,
          showOnProfile,
        },
      },
    });
  }
}
