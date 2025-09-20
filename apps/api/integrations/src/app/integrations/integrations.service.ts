import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { Integration, IntegrationType, UserType } from '@nlc-ai/api-types';

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

  async getCourseIntegrations(userID: string, userType: UserType) {
    return this.prisma.integration.findMany({
      where: {
        userID,
        userType,
        integrationType: 'course'
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
}
