import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import Mailgun from 'mailgun.js';
import {EventsList} from "mailgun.js/definitions";
import formData from 'form-data';
import {
  EmailDeliveryResult,
  EmailMessageStatus,
  EmailProviderHealth,
  IEmailProvider, SendEmailRequest
} from '@nlc-ai/types';

@Injectable()
export class MailgunService implements IEmailProvider {
  private readonly logger = new Logger(MailgunService.name);
  private readonly mailgun: any;
  private readonly domain: string;
  private readonly defaultSender: string;

  constructor(private config: ConfigService) {
    const mg = new Mailgun(formData);
    this.mailgun = mg.client({
      username: 'api',
      key: this.config.get<string>('email.mailgun.apiKey')!,
      url: this.config.get<string>('email.mailgun.url', 'https://api.mailgun.net'),
    });
    this.domain = this.config.get<string>('email.mailgun.domain')!;
    this.defaultSender = this.config.get('email.mailgun.fromEmail')!;
  }

  async sendEmail(message: SendEmailRequest, from?: string): Promise<EmailDeliveryResult> {
    try {
      from = from || this.defaultSender;

      const mailgunMessage = this.transformMessage(message);

      const result = await this.mailgun.messages.create(this.domain, {
        ...mailgunMessage,
        from,
      });

      return {
        messageID: result.id,
        providerMessageID: result.id,
        status: EmailMessageStatus.SENT,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('Failed to send email via Mailgun', error);
      return {
        messageID: `failed-${Date.now()}`,
        providerMessageID: '',
        status: EmailMessageStatus.FAILED,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async sendBulkEmails(messages: SendEmailRequest[], from: string): Promise<EmailDeliveryResult[]> {
    const results = await Promise.allSettled(
      messages.map(message => this.sendEmail(message, from))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        this.logger.error(`Bulk email ${index} failed:`, result.reason);
        return {
          messageID: `bulk-failed-${index}-${Date.now()}`,
          providerMessageID: '',
          status: EmailMessageStatus.FAILED,
          timestamp: new Date().toISOString(),
          error: result.reason?.message || 'Unknown error',
        };
      }
    });
  }

  async getHealth(): Promise<EmailProviderHealth> {
    const startTime = Date.now();

    try {
      await this.mailgun.domains.get(this.domain);

      return {
        provider: 'mailgun',
        status: 'healthy',
        isHealthy: true,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        errorRate: 0,
      };
    } catch (error) {
      this.logger.error('Mailgun health check failed', error);
      return {
        provider: 'mailgun',
        status: 'unhealthy',
        isHealthy: false,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        errorRate: 100,
      };
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async getDeliveryStatus(messageID: string) {
    try {
      const events: EventsList = await this.mailgun.events.get(this.domain, {
        'message-id': messageID,
      });

      return {
        status: events.items[0]?.event || 'unknown',
        events: events.items.map(item => ({
          event: item.event,
          timestamp: item.timestamp.toString(),
          data: item,
        })),
      };
    } catch (error) {
      this.logger.error('Failed to get delivery status', error);
      throw error;
    }
  }

  private transformMessage(message: SendEmailRequest): any {
    const mailgunMessage: any = {
      to: Array.isArray(message.to) ? message.to.join(',') : message.to,
      subject: message.subject,
    };

    if (message.text) mailgunMessage.text = message.text;
    if (message.html) mailgunMessage.html = message.html;
    if (message.cc) mailgunMessage.cc = Array.isArray(message.cc) ? message.cc.join(',') : message.cc;
    if (message.bcc) mailgunMessage.bcc = Array.isArray(message.bcc) ? message.bcc.join(',') : message.bcc;

    if (message.tags?.length) {
      mailgunMessage['o:tag'] = message.tags;
    }

    if (message.metadata) {
      Object.keys(message.metadata).forEach(key => {
        mailgunMessage[`v:${key}`] = message.metadata![key];
      });
    }

    if (message.attachments?.length) {
      mailgunMessage.attachment = message.attachments.map(att => ({
        data: att.content,
        filename: att.filename,
        contentType: att.contentType,
      }));
    }

    return mailgunMessage;
  }
}
