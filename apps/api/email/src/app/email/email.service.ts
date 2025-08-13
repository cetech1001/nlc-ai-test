import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@nlc-ai/api-database';
import { OutboxService } from '@nlc-ai/api-messaging';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import {getPasswordResetEmailTemplate, getVerificationEmailTemplate} from "./templates/auth";

export interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  templateID?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly mailgun: any;
  private readonly domain: string;
  private readonly fromEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>('email.mailgun.apiKey');
    this.domain = this.configService.get<string>('email.mailgun.domain', '');
    this.fromEmail = this.configService.get<string>('email.mailgun.fromEmail', '');

    if (apiKey && this.domain) {
      const mailgun = new Mailgun(FormData);
      this.mailgun = mailgun.client({
        username: 'api',
        key: apiKey,
        url: this.configService.get<string>('email.mailgun.url', 'https://api.mailgun.net'),
      });
    } else {
      this.logger.warn('Mailgun not configured - emails will be logged only');
    }
  }

  async sendEmail(request: SendEmailRequest): Promise<{ messageID: string; status: number; message: string }> {
    const { to, subject, html, text, from, templateID, metadata } = request;

    // Store email record
    const emailRecord = await this.prisma.emailMessage.create({
      data: {
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
        from: from || this.fromEmail,
        templateID,
        metadata: metadata || {},
        status: 'pending',
      },
    });

    if (!this.mailgun) {
      this.logger.log(`📧 Email would be sent to ${to}`);
      this.logger.log(`Subject: ${subject}`);

      await this.prisma.emailMessage.update({
        where: { id: emailRecord.id },
        data: { status: 'simulated' },
      });

      return {
        messageID: emailRecord.id,
        status: 200,
        message: 'Email simulated (development mode)',
      };
    }

    try {
      const result = await this.mailgun.messages.create(this.domain, {
        from: from || `Next Level Coach AI <${this.fromEmail}>`,
        to: [to],
        subject,
        text: text || html.replace(/<[^>]*>/g, ''),
        html,
      });

      await this.prisma.emailMessage.update({
        where: { id: emailRecord.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          providerMessageID: result.id,
        },
      });

      // Emit email sent event
      await this.outbox.saveAndPublishEvent(
        {
          eventType: 'email.sent',
          schemaVersion: 1,
          payload: {
            emailID: emailRecord.id,
            to,
            subject,
            templateID,
            providerMessageID: result.id,
          },
        },
        'email.sent'
      );

      this.logger.log(`Email sent successfully to ${to}. Message ID: ${result.id}`);

      return {
        messageID: result.id,
        status: 200,
        message: 'Email sent successfully',
      };
    } catch (error) {
      await this.prisma.emailMessage.update({
        where: { id: emailRecord.id },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });

      // Emit email failed event
      await this.outbox.saveAndPublishEvent(
        {
          eventType: 'email.failed',
          schemaVersion: 1,
          payload: {
            emailID: emailRecord.id,
            to,
            subject,
            error: error instanceof Error ? error.message : String(error),
          },
        },
        'email.failed'
      );

      this.logger.error(`Failed to send email to ${to}:`, error);

      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.log(`📧 Development fallback - Email to ${to}:`);
        this.logger.log(`Subject: ${subject}`);
      }

      return {
        messageID: emailRecord.id,
        status: 500,
        message: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const subject = 'Verify Your Next Level Coach AI Account';
    const html = getVerificationEmailTemplate(code);
    const text = `Your verification code is: ${code}. This code expires in 10 minutes.`;

    await this.sendEmail({ to: email, subject, html, text });
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const subject = 'Reset Your Next Level Coach AI Password';
    const html = getPasswordResetEmailTemplate(code);
    const text = `Your password reset code is: ${code}. This code expires in 10 minutes.`;

    await this.sendEmail({ to: email, subject, html, text });
  }
}
