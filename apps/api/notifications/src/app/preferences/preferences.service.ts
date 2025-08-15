import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { UserType } from '@nlc-ai/api-types';
import { UpdatePreferencesDto } from './dto';

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(userID: string, userType: UserType) {
    let preferences = await this.prisma.notificationPreference.findUnique({
      where: {
        userID_userType: {
          userID,
          userType: userType.toString(),
        },
      },
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await this.prisma.notificationPreference.create({
        data: {
          userID,
          userType: userType.toString(),
          emailEnabled: true,
          pushEnabled: true,
          preferences: {},
        },
      });
    }

    return { preferences };
  }

  async updatePreferences(
    userID: string,
    userType: UserType,
    updateDto: UpdatePreferencesDto,
  ) {
    const preferences = await this.prisma.notificationPreference.upsert({
      where: {
        userID_userType: {
          userID,
          userType: userType.toString(),
        },
      },
      update: {
        ...updateDto,
        updatedAt: new Date(),
      },
      create: {
        userID,
        userType: userType.toString(),
        emailEnabled: updateDto.emailEnabled ?? true,
        pushEnabled: updateDto.pushEnabled ?? true,
        webhookUrl: updateDto.webhookUrl,
        preferences: updateDto.preferences ?? {},
      },
    });

    return {
      message: 'Preferences updated successfully',
      preferences,
    };
  }

  // Method for channels to check if they're enabled
  async isChannelEnabled(
    userID: string,
    userType: UserType,
    channel: 'email' | 'push' | 'webhook',
  ): Promise<boolean> {
    const preferences = await this.getPreferences(userID, userType);

    switch (channel) {
      case 'email':
        return preferences.preferences.emailEnabled ?? true;
      case 'push':
        return preferences.preferences.pushEnabled ?? true;
      case 'webhook':
        return !!preferences.preferences.webhookUrl;
      default:
        return false;
    }
  }

  async getWebhookUrl(userID: string, userType: UserType): Promise<string | null> {
    const preferences = await this.getPreferences(userID, userType);
    return preferences.preferences.webhookUrl || null;
  }
}
