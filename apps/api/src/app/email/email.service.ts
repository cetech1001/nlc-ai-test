import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import {getPasswordResetEmailTemplate, getVerificationEmailTemplate, getWelcomeEmailTemplate} from "./templates/auth";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly mailgun: any;
  private readonly domain: string;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('MAILGUN_API_KEY');
    this.domain = this.configService.get<string>('MAILGUN_DOMAIN', '');
    this.fromEmail = this.configService.get<string>('FROM_EMAIL', '');

    if (apiKey && this.domain) {
      const mailgun = new Mailgun(FormData);
      this.mailgun = mailgun.client({
        username: 'api',
        key: apiKey,
        url: this.configService.get<string>('MAILGUN_URL', 'https://api.mailgun.net'),
      });
    } else {
      this.logger.warn('Mailgun not configured - emails will be logged only');
    }
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const subject = 'Verify Your Next Level Coach AI Account';
    const html = getVerificationEmailTemplate(code);
    const text = `Your verification code is: ${code}. This code expires in 10 minutes.`;

    await this.sendEmail(email, subject, html, text);
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const subject = 'Reset Your Next Level Coach AI Password';
    const html = getPasswordResetEmailTemplate(code);
    const text = `Your password reset code is: ${code}. This code expires in 10 minutes.`;

    await this.sendEmail(email, subject, html, text);
  }

  async sendWelcomeEmail(email: string, name: string, frontendURL: string): Promise<void> {
    const subject = 'Welcome to Next Level Coach AI';
    const html = getWelcomeEmailTemplate(name, frontendURL);
    const text = `Welcome to Next Level Coach AI, ${name}! Your account has been successfully created.`;

    await this.sendEmail(email, subject, html, text);
  }

  private async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    if (!this.mailgun) {
      this.logger.log(`📧 Email would be sent to ${to}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Text: ${text}`);
      return;
    }

    try {
      const result = await this.mailgun.messages.create(this.domain, {
        from: `Next Level Coach AI <${this.fromEmail}>`,
        to: [to],
        subject,
        text,
        html,
      });

      this.logger.log(`Email sent successfully to ${to}. Message ID: ${result.id}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);

      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.log(`📧 Development fallback - Email to ${to}:`);
        this.logger.log(`Subject: ${subject}`);
        this.logger.log(`Text: ${text}`);
      } else {
        throw error;
      }
    }
  }
}
