import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { UserType, NotificationPayload, DeliveryResult } from '@nlc-ai/api-types';
import { EmailChannelService } from '../channels/email/email-channel.service';
import { PushChannelService } from '../channels/push/push-channel.service';
import { WebhookChannelService } from '../channels/webhook/webhook-channel.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly emailChannel: EmailChannelService,
    private readonly pushChannel: PushChannelService,
    private readonly webhookChannel: WebhookChannelService,
  ) {}

  async sendNotification(payload: NotificationPayload): Promise<{
    notificationID: string;
    deliveries: Array<{ channel: string; success: boolean; error?: string }>;
  }> {
    this.logger.log(`Orchestrating notification for user ${payload.userID}`, {
      type: payload.type,
      userType: payload.userType,
    });

    // 1. Create in-app notification for dashboard bell
    const notification = await this.notificationsService.createInternalNotification({
      userID: payload.userID,
      userType: payload.userType,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      actionUrl: payload.actionUrl,
      priority: payload.priority,
      metadata: payload.metadata,
    });

    // 2. Determine enabled channels and send
    const channels = [
      { name: 'email', service: this.emailChannel },
      { name: 'push', service: this.pushChannel },
      { name: 'webhook', service: this.webhookChannel },
    ];

    const deliveries: Array<{ channel: string; success: boolean; error?: string }> = [];

    for (const channel of channels) {
      try {
        // Check if channel is enabled for user
        const isEnabled = await channel.service.isEnabled(payload.userID, payload.userType);

        if (!isEnabled) {
          this.logger.debug(`Channel ${channel.name} disabled for user ${payload.userID}`);
          continue;
        }

        // Validate payload for channel
        if (!channel.service.validatePayload(payload)) {
          this.logger.warn(`Invalid payload for channel ${channel.name}`);
          deliveries.push({
            channel: channel.name,
            success: false,
            error: 'Invalid payload',
          });
          continue;
        }

        // Send notification via channel
        const result = await channel.service.send(payload);

        // Track delivery
        await this.trackDelivery(notification.id, channel.name, result);

        deliveries.push({
          channel: channel.name,
          success: result.success,
          error: result.error,
        });

        this.logger.log(`Channel ${channel.name} delivery: ${result.success ? 'success' : 'failed'}`, {
          messageID: result.messageID,
          error: result.error,
        });

      } catch (error) {
        this.logger.error(`Channel ${channel.name} error:`, error);

        deliveries.push({
          channel: channel.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Track failed delivery
        await this.trackDelivery(notification.id, channel.name, {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      notificationID: notification.id,
      deliveries,
    };
  }

  private async trackDelivery(
    notificationID: string,
    channel: string,
    result: DeliveryResult,
  ): Promise<void> {
    try {
      await this.prisma.notificationDelivery.create({
        data: {
          notificationID,
          channel,
          status: result.success ? 'delivered' : 'failed',
          messageID: result.messageID,
          error: result.error,
          deliveredAt: result.deliveredAt,
        },
      });
    } catch (error) {
      this.logger.error('Failed to track delivery:', error);
    }
  }

  // Helper methods for common notification types
  async sendSystemNotification(
    userID: string,
    userType: UserType,
    title: string,
    message: string,
    actionUrl?: string,
  ) {
    return this.sendNotification({
      userID,
      userType,
      type: 'system',
      title,
      message,
      actionUrl,
      priority: 'normal',
    });
  }

  async sendUrgentNotification(
    userID: string,
    userType: UserType,
    title: string,
    message: string,
    actionUrl?: string,
  ) {
    return this.sendNotification({
      userID,
      userType,
      type: 'urgent',
      title,
      message,
      actionUrl,
      priority: 'urgent',
    });
  }

  async sendBulkNotifications(payloads: NotificationPayload[]): Promise<void> {
    this.logger.log(`Sending ${payloads.length} bulk notifications`);

    // Process in batches to avoid overwhelming the system
    const batchSize = 50;
    for (let i = 0; i < payloads.length; i += batchSize) {
      const batch = payloads.slice(i, i + batchSize);

      const promises = batch.map(payload =>
        this.sendNotification(payload).catch(error => {
          this.logger.error(`Bulk notification failed for user ${payload.userID}:`, error);
          return null;
        })
      );

      await Promise.all(promises);
    }
  }
}
