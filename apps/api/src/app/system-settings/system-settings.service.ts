import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCalendlySettings() {
    try {
      const settings = await this.prisma.systemSetting.findMany({
        where: {
          category: 'calendly',
        },
      });

      const calendlyData: any = {
        isConnected: false,
      };

      settings.forEach(setting => {
        if (setting.key === 'access_token' && setting.value) {
          calendlyData.isConnected = true;
        }
        calendlyData[setting.key] = setting.value;
      });

      return {
        isConnected: calendlyData.isConnected,
        accessToken: calendlyData.access_token,
        organizationUri: calendlyData.organization_uri,
        userUri: calendlyData.user_uri,
        schedulingUrl: calendlyData.scheduling_url,
        userName: calendlyData.user_name,
        userEmail: calendlyData.user_email,
      };
    } catch (error) {
      return { isConnected: false };
    }
  }

  async saveCalendlySettings(adminID: string, accessToken: string) {
    try {
      const response = await fetch('https://api.calendly.com/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new BadRequestException('Invalid Calendly access token');
      }

      const userData: any = await response.json();
      const user = userData.resource;

      const settingsToSave = [
        { key: 'access_token', value: accessToken },
        { key: 'user_uri', value: user.uri },
        { key: 'user_name', value: user.name },
        { key: 'user_email', value: user.email },
        { key: 'organization_uri', value: user.current_organization },
        { key: 'scheduling_url', value: user.scheduling_url },
      ];

      await this.prisma.$transaction(async (tx) => {
        for (const setting of settingsToSave) {
          await tx.systemSetting.upsert({
            where: {
              category_key: {
                category: 'calendly',
                key: setting.key,
              },
            },
            update: {
              value: setting.value,
              updatedBy: adminID,
              updatedAt: new Date(),
            },
            create: {
              category: 'calendly',
              key: setting.key,
              value: setting.value,
              description: `Calendly ${setting.key.replace('_', ' ')}`,
              isPublic: false,
              updatedBy: adminID,
            },
          });
        }
      });

      return {
        success: true,
        message: 'Calendly settings saved successfully',
        data: {
          isConnected: true,
          userName: user.name,
          userEmail: user.email,
          schedulingUrl: user.scheduling_url,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to save Calendly settings');
    }
  }

  async deleteCalendlySettings(adminID: string) {
    try {
      await this.prisma.systemSetting.deleteMany({
        where: {
          category: 'calendly',
          updatedBy: adminID,
        },
      });

      return {
        success: true,
        message: 'Calendly settings deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Failed to delete Calendly settings');
    }
  }
}
