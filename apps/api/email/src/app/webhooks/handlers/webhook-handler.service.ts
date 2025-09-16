import {EmailAnalytics} from "@nlc-ai/api-types";
import {PrismaService} from "@nlc-ai/api-database";
import {OutboxService} from "@nlc-ai/api-messaging";
import {EMAIL_ROUTING_KEYS, EmailBouncedEvent, EmailEvent, EmailOpenedEvent} from "@nlc-ai/types";
import {Logger} from "@nestjs/common";

export class WebhookHandlerService {
  private readonly logger = new Logger(WebhookHandlerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {
  }

  async trackEmailOpen(messageID: string, analytics: Partial<EmailAnalytics>): Promise<void> {
    try {
      const message = await this.prisma.emailMessage.update({
        where: { providerMessageID: messageID },
        data: {
          metadata: {
            analytics: {
              opened: true,
              openedAt: new Date(),
              ...analytics,
            }
          }
        }
      });

      await this.outbox.saveAndPublishEvent<EmailOpenedEvent>(
        {
          eventType: 'email.opened',
          schemaVersion: 1,
          payload: {
            messageID,
            recipientEmail: message.to,
            // @ts-ignore
            openedAt: new Date().toISOString(),
            ...analytics,
          },
        },
        EMAIL_ROUTING_KEYS.OPENED
      );
    } catch (error) {
      this.logger.error(`Failed to track email open for ${messageID}:`, error);
    }
  }

  async trackEmailClick(messageID: string, clickedUrl: string, analytics: Partial<EmailAnalytics>): Promise<void> {
    try {
      await this.prisma.emailMessage.update({
        where: { providerMessageID: messageID },
        data: {
          metadata: {
            analytics: {
              clicked: true,
              clickedAt: new Date(),
              clickedUrl,
              ...analytics,
            }
          }
        }
      });

      await this.outbox.saveAndPublishEvent<EmailEvent>(
        {
          eventType: 'email.clicked',
          schemaVersion: 1,
          payload: {
            messageID,
            clickedUrl,
            // @ts-ignore
            clickedAt: new Date().toISOString(),
            ...analytics,
          },
        },
        'email.clicked'
      );
    } catch (error) {
      this.logger.error(`Failed to track email click for ${messageID}:`, error);
    }
  }

  async trackEmailBounce(messageID: string, reason: string): Promise<void> {
    try {
      const message = await this.prisma.emailMessage.update({
        where: { providerMessageID: messageID },
        data: {
          status: 'bounced',
          metadata: {
            analytics: {
              bounced: true,
              bounceReason: reason,
              bouncedAt: new Date(),
            }
          }
        }
      });

      await this.outbox.saveAndPublishEvent<EmailBouncedEvent>(
        {
          eventType: 'email.bounced',
          schemaVersion: 1,
          payload: {
            messageID,
            reason,
            recipientEmail: message.to,
            bounceType: 'soft',
            bouncedAt: new Date().toISOString(),
          },
        },
        'email.bounced'
      );
    } catch (error) {
      this.logger.error(`Failed to track email bounce for ${messageID}:`, error);
    }
  }

  async trackEmailComplaint(messageID: string): Promise<void> {
    try {
      const message = await this.prisma.emailMessage.update({
        where: { providerMessageID: messageID },
        data: {
          metadata: {
            analytics: {
              complained: true,
              complainedAt: new Date(),
            }
          }
        }
      });

      await this.outbox.saveAndPublishEvent<EmailEvent>(
        {
          eventType: 'email.complained',
          schemaVersion: 1,
          payload: {
            messageID,
            recipientEmail: message.to,
            complainedAt: new Date().toISOString(),
          },
        },
        'email.complained'
      );
    } catch (error) {
      this.logger.error(`Failed to track email complaint for ${messageID}:`, error);
    }
  }

  async trackEmailUnsubscribe(messageID: string, recipientEmail: string): Promise<void> {
    try {
      await this.prisma.emailMessage.update({
        where: { providerMessageID: messageID },
        data: {
          metadata: {
            analytics: {
              unsubscribed: true,
              unsubscribedAt: new Date(),
            }
          }
        }
      });

      await this.outbox.saveAndPublishEvent<EmailEvent>(
        {
          eventType: 'email.unsubscribed',
          schemaVersion: 1,
          payload: {
            messageID,
            recipientEmail,
            unsubscribedAt: new Date().toISOString(),
          },
        },
        'email.unsubscribed'
      );
    } catch (error) {
      this.logger.error(`Failed to track email unsubscribe for ${messageID}:`, error);
    }
  }
}
