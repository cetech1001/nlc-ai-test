import { Controller, Post, Body, Headers, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '@nlc-ai/api-auth';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@nlc-ai/api-database';
import {EmailStatus, MailgunWebhookEvent} from "@nlc-ai/api-types";
import {MailgunWebhookDto} from "./dto";
import {createHmac} from "crypto";
import {WebhookHandlerService} from "./handlers/webhook-handler.service";

@ApiTags('Mailgun Webhooks')
@Controller('webhooks/mailgun')
@Public()
export class MailgunWebhookController {
  private readonly logger = new Logger(MailgunWebhookController.name);
  private readonly webhookSigningKey: string;

  constructor(
    private readonly handlerService: WebhookHandlerService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.webhookSigningKey = this.configService.get<string>('email.mailgun.webhookSigningKey', '');
  }

  @Post()
  @ApiOperation({ summary: 'Handle Mailgun webhook events' })
  async handleMailgunWebhook(
    @Body() body: MailgunWebhookDto,
    @Headers('X-Mailgun-Signature') signature: string,
    @Res() res: Response,
  ) {
    try {
      if (this.webhookSigningKey && !this.verifySignature(body, signature)) {
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

  private verifySignature(body: MailgunWebhookEvent, signature: string): boolean {
    if (!this.webhookSigningKey) return true;

    try {
      const { token, timestamp, signature: providedSignature } = body.signature;
      return this.verifyMailgunWebhookSignature(
        token,
        timestamp,
        providedSignature,
        this.webhookSigningKey
      );
    } catch (error) {
      this.logger.error('Error verifying Mailgun signature:', error);
      return false;
    }
  }

  private async handleEmailDelivered(eventData: any): Promise<void> {
    const messageID = eventData.message.headers['message-id'];
    this.logger.log(`Email delivered: ${messageID} to ${eventData.recipient}`);
  }

  private async handleEmailOpened(eventData: any): Promise<void> {
    const messageID = eventData.message.headers['message-id'];
    try {
      await this.handlerService.trackEmailOpen(messageID, {
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
      await this.handlerService.trackEmailClick(messageID, eventData.url, {
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
      await this.handlerService.trackEmailBounce(messageID, reason);
      if (eventData.severity === 'permanent') {
        this.logger.warn(`Permanent bounce for ${eventData.recipient}: ${reason}`);
      }
      this.logger.log(`Email bounced: ${messageID} to ${eventData.recipient}, reason: ${reason}`);
    } catch (error) {
      this.logger.error(`Error handling email bounced event for ${messageID}:`, error);
    }
  }

  private async handleEmailComplained(eventData: any): Promise<void> {
    const messageID = eventData.message.headers['message-id'];
    try {
      await this.handlerService.trackEmailComplaint(messageID);
      this.logger.warn(`Spam complaint from ${eventData.recipient} for message ${messageID}`);
    } catch (error) {
      this.logger.error(`Error handling email complaint event for ${messageID}:`, error);
    }
  }

  private async handleEmailUnsubscribed(eventData: any): Promise<void> {
    const messageID = eventData.message.headers['message-id'];
    try {
      await this.handlerService.trackEmailUnsubscribe(messageID, eventData.recipient);
      await this.handleUnsubscribeInDatabase(eventData.recipient);
      this.logger.log(`Email unsubscribe: ${messageID} from ${eventData.recipient}`);
    } catch (error) {
      this.logger.error(`Error handling email unsubscribe event for ${messageID}:`, error);
    }
  }

  private async handleUnsubscribeInDatabase(email: string): Promise<void> {
    try {
      await this.prisma.lead.updateMany({
        where: { email },
        data: { marketingOptIn: false },
      });

      await this.prisma.coach.updateMany({
        where: { email },
        data: { marketingOptIn: false },
      });

      await this.prisma.client.updateMany({
        where: { email },
        data: { marketingOptIn: false },
      });

      await this.prisma.emailMessage.updateMany({
        where: {
          OR: [
            { coach: { email } },
            { lead: { email } },
            { client: { email } },
          ],
          status: { in: [EmailStatus.SCHEDULED, EmailStatus.PAUSED] },
        },
        data: { status: EmailStatus.CANCELLED },
      });

      this.logger.log(`Updated database for unsubscribed email: ${email}`);
    } catch (error) {
      this.logger.error(`Error updating database for unsubscribe ${email}:`, error);
    }
  }

  private verifyMailgunWebhookSignature(token: string, timestamp: string, signature: string, signingKey: string): boolean {
    const value = timestamp + token;
    const hash = createHmac('sha256', signingKey).update(value).digest('hex');
    return hash === signature;
  }
}
