import { Controller, Post, Body, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { EmailService } from '../email/email.service';
import { Public } from '@nlc-ai/api-auth';
import {SendGridWebhookDto} from "./dto";

@ApiTags('SendGrid Webhooks')
@Controller('webhooks/sendgrid')
@Public()
export class SendGridWebhookController {
  private readonly logger = new Logger(SendGridWebhookController.name);

  constructor(private readonly emailService: EmailService) {}

  @Post()
  @ApiOperation({ summary: 'Handle SendGrid webhook events' })
  async handleSendGridWebhook(@Body() body: SendGridWebhookDto, @Res() res: Response) {
    try {
      const { events } = body;
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

  private convertSendGridEvent(event: any): any {
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
    this.logger.log(`Email delivered: ${messageID} to ${eventData.recipient}`);
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
    } catch (error) {
      this.logger.error(`Error handling email clicked event for ${messageID}:`, error);
    }
  }

  private async handleEmailBounced(eventData: any): Promise<void> {
    const messageID = eventData.message.headers['message-id'];
    const reason = eventData.reason || eventData.description || 'Unknown bounce reason';
    try {
      await this.emailService.trackEmailBounce(messageID, reason);
    } catch (error) {
      this.logger.error(`Error handling email bounced event for ${messageID}:`, error);
    }
  }

  private async handleEmailComplained(eventData: any): Promise<void> {
    const messageID = eventData.message.headers['message-id'];
    try {
      await this.emailService.trackEmailComplaint(messageID);
    } catch (error) {
      this.logger.error(`Error handling email complaint event for ${messageID}:`, error);
    }
  }

  private async handleEmailUnsubscribed(eventData: any): Promise<void> {
    const messageID = eventData.message.headers['message-id'];
    try {
      await this.emailService.trackEmailUnsubscribe(messageID, eventData.recipient);
    } catch (error) {
      this.logger.error(`Error handling email unsubscribe event for ${messageID}:`, error);
    }
  }
}
