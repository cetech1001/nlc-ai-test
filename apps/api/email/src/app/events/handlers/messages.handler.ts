import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { PrismaService } from '@nlc-ai/api-database';
import { SendService } from '../../send/send.service';
import { ConfigService } from '@nestjs/config';
import { EmailStatus, UserType } from '@nlc-ai/types';

@Injectable()
export class MessagesHandler implements OnApplicationBootstrap {
  private readonly logger = new Logger(MessagesHandler.name);
  private readonly systemFromEmail: string;

  constructor(
    private readonly eventBus: EventBusService,
    private readonly prisma: PrismaService,
    private readonly send: SendService,
    private readonly config: ConfigService,
  ) {
    this.systemFromEmail = this.config.get<string>(
      'email.mailgun.fromEmail',
      'support@mail.nextlevelcoach.ai'
    );
  }

  async onApplicationBootstrap() {
    await this.subscribeToEvents();
  }

  private async getTemplateID(key: string): Promise<string> {
    const template = await this.prisma.emailTemplate.findFirst({
      where: {
        OR: [{ systemKey: key }],
      },
      select: { id: true },
    });

    if (!template) {
      this.logger.error(`Email template not found for key "${key}"`);
      throw new Error(`Missing email template: ${key}`);
    }

    return template.id;
  }

  private getInitials(name: string): string {
    if (!name?.trim()) return '?';

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'email.messages-notifications',
      ['messages.notification.email'],
      this.handleEmailNotification.bind(this)
    );

    this.logger.log('✅ Subscribed to messages email notification events');
  }

  private async handleEmailNotification(event: any) {
    try {
      const { payload } = event;
      const {
        recipientID,
        recipientType,
        recipientName,
        senderName,
        senderType,
        messageContent,
        conversationID,
        conversationType,
        senderEmail,
        timestamp,
      } = payload;

      // Get recipient email based on type
      let recipientEmail: string | null = null;

      switch (recipientType) {
        case UserType.COACH: {
          const coach = await this.prisma.coach.findUnique({
            where: { id: recipientID },
            select: { email: true },
          });
          recipientEmail = coach?.email || null;
          break;
        }

        case UserType.CLIENT: {
          const client = await this.prisma.client.findUnique({
            where: { id: recipientID },
            select: { email: true },
          });
          recipientEmail = client?.email || null;
          break;
        }

        case UserType.ADMIN: {
          this.logger.log(`Came in here: Recipient ID: ${recipientID}`);
          const admin = await this.prisma.admin.findUnique({
            where: { id: recipientID },
            select: { email: true },
          });
          console.log("Admin: ", admin);
          recipientEmail = admin?.email || null;
          break;
        }
      }

      if (!recipientEmail) {
        this.logger.warn(`No email found for ${recipientType}:${recipientID}`);
        return;
      }

      // Determine email template based on conversation type
      let templateKey = 'user_new_message';
      if (conversationType === 'coach_to_admin') {
        templateKey = 'admin_new_message';
      }

      const emailTemplateID = await this.getTemplateID(templateKey);

      // Get platform URL based on user type
      let platformUrl = this.config.get('email.platforms.coach', '');
      if (recipientType === UserType.CLIENT) {
        platformUrl = this.config.get('email.platforms.client', '');
      } else if (recipientType === UserType.ADMIN) {
        platformUrl = this.config.get('email.platforms.admin', '');
      }

      const messageUrl = `${platformUrl}/messages?conversationID=${conversationID}`;

      // Create truncated message preview (max 100 chars)
      const messagePreview = messageContent.length > 100
        ? messageContent.substring(0, 97) + '...'
        : messageContent;

      const message = await this.prisma.emailMessage.create({
        data: {
          from: this.systemFromEmail,
          to: recipientEmail,
          emailTemplateID,
          status: EmailStatus.PENDING,
          metadata: {
            type: 'transactional',
            recipientName,
            senderName,
            senderType,
            messagePreview,
            viewMessageUrl: messageUrl,
            conversationType,
            senderEmail,
            recipientEmail,
            adminEmail: recipientEmail,
            senderInitial: this.getInitials(senderName),
            messageTime: new Date(timestamp).toLocaleDateString(),
          },
        },
      });

      await this.send.sendSystemEmail(message.id);

      this.logger.log(`📧 Email notification sent to ${recipientType}:${recipientID} (${recipientEmail})`);
    } catch (error) {
      this.logger.error('Failed to send email notification:', error);
    }
  }
}
