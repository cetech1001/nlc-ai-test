import { Controller, Post, Body, Headers, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { EmailService } from '../services/email.service';
import { Public } from '@nlc-ai/api-auth';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';
import {PrismaService} from "@nlc-ai/api-database";

interface MailgunWebhookEvent {
  signature: {
    token: string;
    timestamp: string;
    signature: string;
  };
  'event-data': {
    event: string;
    message: {
      headers: {
        'message-id': string;
      };
    };
    recipient: string;
    timestamp: number;
    'user-variables'?: {
      'email-record-id'?: string;
    };
    'client-info'?: {
      'client-name'?: string;
      'client-os'?: string;
      'device-type'?: string;
      'user-agent'?: string;
    };
    'geolocation'?: {
      city?: string;
      country?: string;
      region?: string;
    };
    ip?: string;
    url?: string; // For click events
    reason?: string; // For bounce/failure events
    code?: string; // For bounce events
    description?: string; // For bounce events
    severity?: string; // permanent or temporary
  };
}

@ApiTags('Email Webhooks')
@Controller('webhooks/email')
@Public()
export class EmailWebhookController {
  private readonly logger = new Logger(EmailWebhookController.name);
  private readonly webhookSigningKey: string;

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.webhookSigningKey = this.configService.get<string>('email.mailgun.webhookSigningKey', '');
  }

  @Post('mailgun')
  @ApiOperation({ summary: 'Handle Mailgun webhook events' })
  async handleMailgunWebhook(
    @Body() body: MailgunWebhookEvent,
    @Headers('X-Mailgun-Signature-Data') signatureData: string,
    @Headers('X-Mailgun-Signature') signature: string,
    @Res() res: Response,
  ) {
    try {
      // Verify webhook signature
      if (this.webhookSigningKey && !this.verifyMailgunSignature(body, signature)) {
        this.logger.warn('Invalid Mailgun webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const eventData = body['event-data'];
      const messageID = eventData.message.headers['message-id'];
      const eventType = eventData.event;

      this.logger.log(`Received Mailgun webhook: ${eventType} for message ${messageID}`);

      switch (eventType) {
        case 'delivered':
          await this.handleEmailDelivered(eventData);
          break;
        case 'opened':
          await this.handleEmailOpened(eventData);
          break;
        case 'clicked':
          await this.handleEmailClicked(eventData);
          break;
        case 'bounced':
        case 'failed':
          await this.handleEmailBounced(eventData);
          break;
        case 'complained':
          await this.handleEmailComplained(eventData);
          break;
        case 'unsubscribed':
          await this.handleEmailUnsubscribed(eventData);
          break;
        default:
          this.logger.log(`Unhandled Mailgun event type: ${eventType}`);
      }

      return res.status(200).json({ status: 'ok' });
    } catch (error) {
      this.logger.error('Error processing Mailgun webhook:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  @Post('sendgrid')
  @ApiOperation({ summary: 'Handle SendGrid webhook events' })
  async handleSendGridWebhook(@Body() events: any[], @Res() res: Response) {
    try {
      for (const event of events) {
        const eventType = event.event;
        const messageID = event.sg_message_id;

        this.logger.log(`Received SendGrid webhook: ${eventType} for message ${messageID}`);

        switch (eventType) {
          case 'delivered':
            await this.handleEmailDelivered(this.convertSendGridEvent(event));
            break;
          case 'open':
            await this.handleEmailOpened(this.convertSendGridEvent(event));
            break;
          case 'click':
            await this.handleEmailClicked(this.convertSendGridEvent(event));
            break;
          case 'bounce':
          case 'dropped':
            await this.handleEmailBounced(this.convertSendGridEvent(event));
            break;
          case 'spamreport':
            await this.handleEmailComplained(this.convertSendGridEvent(event));
            break;
          case 'unsubscribe':
            await this.handleEmailUnsubscribed(this.convertSendGridEvent(event));
            break;
          default:
            this.logger.log(`Unhandled SendGrid event type: ${eventType}`);
        }
      }

      return res.status(200).json({ status: 'ok' });
    } catch (error) {
      this.logger.error('Error processing SendGrid webhook:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  private verifyMailgunSignature(body: MailgunWebhookEvent, signature: string): boolean {
    if (!this.webhookSigningKey) {
      return true; // Skip verification if no key configured
    }

    try {
      const { token, timestamp, signature: providedSignature } = body.signature;
      const value = timestamp + token;
      const hash = createHmac('sha256', this.webhookSigningKey).update(value).digest('hex');

      return hash === providedSignature;
    } catch (error) {
      this.logger.error('Error verifying Mailgun signature:', error);
      return false;
    }
  }

  private convertSendGridEvent(event: any): any {
    // Convert SendGrid event format to our internal format
    return {
      message: {
        headers: {
          'message-id': event.sg_message_id,
        },
      },
      recipient: event.email,
      timestamp: event.timestamp,
      'user-variables': event.unique_args || {},
      'client-info': {
        'user-agent': event.useragent,
      },
      ip: event.ip,
      url: event.url,
      reason: event.reason,
      code: event.status,
      description: event.reason,
    };
  }

  private async handleEmailDelivered(eventData: any): Promise<void> {
    const messageID = eventData.message.headers['message-id'];

    try {
      // Update email status in database if needed
      // This is mainly for logging/analytics purposes
      this.logger.log(`Email delivered: ${messageID} to ${eventData.recipient}`);

      // You could update email status here if tracking delivery is important
      // await this.emailService.trackEmailDelivery(messageID, eventData);
    } catch (error) {
      this.logger.error(`Error handling email delivered event for ${messageID}:`, error);
    }
  }

  private async handleEmailOpened(eventData: any): Promise<void> {
    const messageID = eventData.message.headers['message-id'];

    try {
      await this.emailService.trackEmailOpen(messageID, {
        opened: true,
        openedAt: new Date(eventData.timestamp * 1000),
        userAgent: eventData['client-info']?.['user-agent'],
        ipAddress: eventData.ip,
      });

      this.logger.log(`Email opened: ${messageID} by ${eventData.recipient}`);
    } catch (error) {
      this.logger.error(`Error handling email opened event for ${messageID}:`, error);
    }
  }

  private async handleEmailClicked(eventData: any): Promise<void> {
    const messageID = eventData.message.headers['message-id'];

    try {
      await this.emailService.trackEmailClick(messageID, eventData.url, {
        clicked: true,
        clickedAt: new Date(eventData.timestamp * 1000),
        userAgent: eventData['client-info']?.['user-agent'],
        ipAddress: eventData.ip,
      });

      this.logger.log(`Email clicked: ${messageID} by ${eventData.recipient}, URL: ${eventData.url}`);
    } catch (error) {
      this.logger.error(`Error handling email clicked event for ${messageID}:`, error);
    }
  }

  private async handleEmailBounced(eventData: any): Promise<void> {
    const messageID = eventData.message.headers['message-id'];
    const reason = eventData.reason || eventData.description || 'Unknown bounce reason';

    try {
      await this.emailService.trackEmailBounce(messageID, reason);

      // If it's a permanent bounce, you might want to mark the email as undeliverable
      if (eventData.severity === 'permanent') {
        this.logger.warn(`Permanent bounce for ${eventData.recipient}: ${reason}`);
        // Consider adding the email to a suppression list
        // await this.addToSuppressionList(eventData.recipient, 'bounce');
      }

      this.logger.log(`Email bounced: ${messageID} to ${eventData.recipient}, reason: ${reason}`);
    } catch (error) {
      this.logger.error(`Error handling email bounced event for ${messageID}:`, error);
    }
  }

  private async handleEmailComplained(eventData: any): Promise<void> {
    const messageID = eventData.message.headers['message-id'];

    try {
      await this.emailService.trackEmailComplaint(messageID);

      // Automatically add complainants to suppression list
      this.logger.warn(`Spam complaint from ${eventData.recipient} for message ${messageID}`);
      // await this.addToSuppressionList(eventData.recipient, 'complaint');

      this.logger.log(`Email complaint: ${messageID} from ${eventData.recipient}`);
    } catch (error) {
      this.logger.error(`Error handling email complaint event for ${messageID}:`, error);
    }
  }

  private async handleEmailUnsubscribed(eventData: any): Promise<void> {
    const messageID = eventData.message.headers['message-id'];

    try {
      await this.emailService.trackEmailUnsubscribe(messageID, eventData.recipient);

      // Add to suppression list and update lead/client status
      // await this.addToSuppressionList(eventData.recipient, 'unsubscribe');
      await this.handleUnsubscribeInDatabase(eventData.recipient);

      this.logger.log(`Email unsubscribe: ${messageID} from ${eventData.recipient}`);
    } catch (error) {
      this.logger.error(`Error handling email unsubscribe event for ${messageID}:`, error);
    }
  }

  private async handleUnsubscribeInDatabase(email: string): Promise<void> {
    try {
      // Update lead status if exists
      await this.prisma.lead.updateMany({
        where: { email },
        data: { status: 'unsubscribed' },
      });

      // You might also want to pause/cancel any scheduled emails for this recipient
      await this.prisma.scheduledEmail.updateMany({
        where: {
          OR: [
            { lead: { email } },
            { client: { email } },
          ],
          status: { in: ['scheduled', 'paused'] },
        },
        data: { status: 'cancelled' },
      });

      this.logger.log(`Updated database for unsubscribed email: ${email}`);
    } catch (error) {
      this.logger.error(`Error updating database for unsubscribe ${email}:`, error);
    }
  }

  // Utility method for adding emails to suppression list
  // private async addToSuppressionList(email: string, reason: 'bounce' | 'complaint' | 'unsubscribe'): Promise<void> {
  //   try {
  //     // This would integrate with your email provider's suppression list API
  //     // For Mailgun:
  //     // await this.mailgun.suppressions.create(this.domain, 'bounces', { address: email });
  //
  //     this.logger.log(`Added ${email} to suppression list for ${reason}`);
  //   } catch (error) {
  //     this.logger.error(`Error adding ${email} to suppression list:`, error);
  //   }
  // }
}
