import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { UserType, NotificationChannel, NotificationPayload, DeliveryResult } from '@nlc-ai/api-types';
import { PreferencesService } from '../../preferences/preferences.service';

@Injectable()
export class PushChannelService implements NotificationChannel {
  readonly name = 'push';
  private readonly logger = new Logger(PushChannelService.name);
  private firebaseApp: admin.app.App | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly preferencesService: PreferencesService,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const projectID = this.configService.get<string>('notifications.integrations.firebase.projectID');
      const privateKey = this.configService.get<string>('notifications.integrations.firebase.privateKey');
      const clientEmail = this.configService.get<string>('notifications.integrations.firebase.clientEmail');

      if (projectID && privateKey && clientEmail) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: projectID,
            privateKey: privateKey.replace(/\\n/g, '\n'),
            clientEmail: clientEmail,
          }),
        }, 'notifications-service');

        this.logger.log('Firebase initialized for push notifications');
      } else {
        this.logger.warn('Firebase credentials not configured - push notifications disabled');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error);
    }
  }

  async send(payload: NotificationPayload): Promise<DeliveryResult> {
    if (!this.firebaseApp) {
      return {
        success: false,
        error: 'Firebase not configured',
      };
    }

    try {
      // Get user's FCM tokens (you'd store these when users register for push)
      const tokens = await this.getUserPushTokens(payload.userID, payload.userType);

      if (!tokens || tokens.length === 0) {
        return {
          success: false,
          error: 'No push tokens found for user',
        };
      }

      const message = {
        notification: {
          title: payload.title,
          body: payload.message,
        },
        data: {
          type: payload.type,
          actionUrl: payload.actionUrl || '',
          userID: payload.userID,
          ...payload.metadata,
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#7B21BA',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default',
            },
          },
        },
        tokens: tokens,
      };

      const response = await this.firebaseApp.messaging().sendEachForMulticast(message);

      // Log failed tokens for cleanup
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            this.logger.warn(`Failed to send push notification to token ${tokens[idx]}: ${resp.error?.message}`);
          }
        });

        // Remove invalid tokens
        await this.removeInvalidTokens(payload.userID, payload.userType, failedTokens);
      }

      return {
        success: response.successCount > 0,
        messageID: `firebase-${Date.now()}`,
        deliveredAt: new Date(),
        error: response.failureCount > 0 ? `${response.failureCount} failed deliveries` : undefined,
      };

    } catch (error) {
      this.logger.error('Failed to send push notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async isEnabled(userID: string, userType: UserType): Promise<boolean> {
    return this.preferencesService.isChannelEnabled(userID, userType, 'push');
  }

  validatePayload(payload: NotificationPayload): boolean {
    return !!(payload.userID && payload.title && payload.message);
  }

  private async getUserPushTokens(userID: string, userType: UserType): Promise<string[]> {
    // This would query your database for stored FCM tokens
    // You'd need a table like user_push_tokens with userID, userType, token, platform
    // For now, returning empty array as placeholder

    try {
      // Placeholder implementation - you'd implement based on your token storage
      // const tokens = await this.prisma.userPushToken.findMany({
      //   where: { userID, userType: userType.toString(), isActive: true },
      //   select: { token: true }
      // });
      // return tokens.map(t => t.token);

      return []; // Placeholder
    } catch (error) {
      this.logger.error('Failed to get user push tokens:', error);
      return [];
    }
  }

  private async removeInvalidTokens(userID: string, userType: UserType, invalidTokens: string[]): Promise<void> {
    try {
      // Remove invalid tokens from your database
      // await this.prisma.userPushToken.updateMany({
      //   where: {
      //     userID,
      //     userType: userType.toString(),
      //     token: { in: invalidTokens }
      //   },
      //   data: { isActive: false }
      // });

      this.logger.log(`Marked ${invalidTokens.length} push tokens as inactive`);
    } catch (error) {
      this.logger.error('Failed to remove invalid push tokens:', error);
    }
  }
}
