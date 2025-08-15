import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UserType, NotificationChannel, NotificationPayload, DeliveryResult } from '@nlc-ai/api-types';
import { PreferencesService } from '../../preferences/preferences.service';

@Injectable()
export class WebhookChannelService implements NotificationChannel {
  readonly name = 'webhook';
  private readonly logger = new Logger(WebhookChannelService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly preferencesService: PreferencesService,
  ) {}

  async send(payload: NotificationPayload): Promise<DeliveryResult> {
    try {
      const webhookUrl = await this.preferencesService.getWebhookUrl(payload.userID, payload.userType);

      if (!webhookUrl) {
        return {
          success: false,
          error: 'No webhook URL configured for user',
        };
      }

      const webhookPayload = {
        event: 'notification.created',
        timestamp: new Date().toISOString(),
        data: {
          id: `webhook-${Date.now()}`,
          userID: payload.userID,
          userType: payload.userType,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          actionUrl: payload.actionUrl,
          priority: payload.priority,
          metadata: payload.metadata,
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(webhookUrl, webhookPayload, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'NextLevelCoach-Notifications/1.0',
            'X-NLC-Event': 'notification.created',
          },
          timeout: 30000, // 30 second timeout
        })
      );

      return {
        success: response.status >= 200 && response.status < 300,
        messageID: `webhook-${Date.now()}`,
        deliveredAt: new Date(),
      };

    } catch (error) {
      this.logger.error('Failed to send webhook notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async isEnabled(userID: string, userType: UserType): Promise<boolean> {
    return this.preferencesService.isChannelEnabled(userID, userType, 'webhook');
  }

  validatePayload(payload: NotificationPayload): boolean {
    return !!(payload.userID && payload.title && payload.message);
  }
}
