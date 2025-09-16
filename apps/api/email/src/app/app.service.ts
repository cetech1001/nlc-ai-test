import { Injectable, Logger } from '@nestjs/common';
import { TransactionalService } from './transactional/transactional.service';
import { DeliveryService } from './delivery/delivery.service';
import { ProvidersService } from './providers/providers.service';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly transactionalService: TransactionalService,
    private readonly deliveryService: DeliveryService,
    private readonly providersService: ProvidersService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    return this.transactionalService.sendVerificationEmail(email, code);
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    return this.transactionalService.sendPasswordResetEmail(email, code);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    return this.transactionalService.sendWelcomeEmail(email, name);
  }

  async sendPaymentRequestEmail(data: {
    to: string;
    coachName: string;
    planName: string;
    planDescription?: string;
    amount: number;
    paymentLink: string;
    description?: string;
  }): Promise<void> {
    return this.transactionalService.sendPaymentRequestEmail(data);
  }

  async sendCustomEmail(data: {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    templateID?: string;
    metadata?: Record<string, any>;
  }): Promise<{ messageID: string; status: number; message: string }> {
    const from = data.from || this.configService.get<string>('email.mailgun.fromEmail')!;

    const result = await this.providersService.sendEmail({
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
      templateID: data.templateID,
      metadata: data.metadata,
    }, from);

    return {
      messageID: result.messageID,
      status: result.status === 'sent' ? 200 : 500,
      message: result.status === 'sent' ? 'Email sent successfully' : result.error || 'Failed to send email',
    };
  }

  async queueThreadReply(messageID: string): Promise<void> {
    return this.deliveryService.sendThreadReply(messageID);
  }

  async queueCoachEmail(messageID: string): Promise<void> {
    return this.deliveryService.sendCoachEmail(messageID);
  }

  async sendEmail(request: any): Promise<{ messageID: string; status: number; message: string }> {
    this.logger.warn('Using deprecated sendEmail method. Consider using specific email type methods.');
    return this.sendCustomEmail(request);
  }

  async sendNotificationEmail(data: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    templateType?: string;
  }): Promise<void> {
    return this.transactionalService.sendNotificationEmail(data);
  }
}
