import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UserType, NotificationChannel, NotificationPayload, DeliveryResult } from '@nlc-ai/api-types';
import { PreferencesService } from '../../preferences/preferences.service';
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class EmailChannelService implements NotificationChannel {
  readonly name = 'email';
  private readonly logger = new Logger(EmailChannelService.name);
  private readonly emailServiceUrl: string;
  private readonly emailServiceToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly preferencesService: PreferencesService,
    private readonly prisma: PrismaService,
  ) {
    this.emailServiceUrl = this.configService.get<string>('notifications.integrations.emailService.url', '');
    this.emailServiceToken = this.configService.get<string>('notifications.integrations.emailService.token', '');
  }

  async send(payload: NotificationPayload): Promise<DeliveryResult> {
    try {
      // Get user email based on userType
      const userEmail = await this.getUserEmail(payload.userID, payload.userType);
      if (!userEmail) {
        return {
          success: false,
          error: 'User email not found',
        };
      }

      // Prepare email payload for your email service
      const emailPayload = {
        to: userEmail,
        subject: payload.title,
        html: this.buildEmailHtml(payload),
        text: payload.message,
        templateID: 'notification',
        metadata: {
          notificationType: payload.type,
          userID: payload.userID,
          userType: payload.userType,
          ...payload.metadata,
        },
      };

      // Call your email service
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.emailServiceUrl}/api/email/send`,
          emailPayload,
          {
            headers: {
              'Authorization': `Bearer ${this.emailServiceToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      return {
        success: response.status === 200,
        messageID: response.data.messageID,
        deliveredAt: new Date(),
      };

    } catch (error) {
      this.logger.error('Failed to send email notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async isEnabled(userID: string, userType: UserType): Promise<boolean> {
    const {preferences} = await this.preferencesService.getPreferences(userID, userType);
    return preferences?.emailEnabled ?? true; // Default to enabled
  }

  validatePayload(payload: NotificationPayload): boolean {
    return !!(payload.userID && payload.title && payload.message);
  }

  private async getUserEmail(userID: string, userType: UserType): Promise<string | null> {
    // This would query your database to get the user's email
    // Implementation depends on your user tables structure
    try {
      switch (userType) {
        case UserType.coach:
          const coach = await this.prisma.coach.findUnique({
            where: { id: userID },
            select: { email: true },
          });
          return coach?.email || null;

        case UserType.admin:
          const admin = await this.prisma.admin.findUnique({
            where: { id: userID },
            select: { email: true },
          });
          return admin?.email || null;

        case UserType.client:
          const client = await this.prisma.client.findUnique({
            where: { id: userID },
            select: { email: true },
          });
          return client?.email || null;

        default:
          return null;
      }
    } catch (error) {
      this.logger.error('Failed to get user email:', error);
      return null;
    }
  }

  private buildEmailHtml(payload: NotificationPayload): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 20px; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${payload.title}</h1>
          </div>
          <div class="content">
            <p>${payload.message}</p>
            ${payload.actionUrl ? `<a href="${payload.actionUrl}" class="button">Take Action</a>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
