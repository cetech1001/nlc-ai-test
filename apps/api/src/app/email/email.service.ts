import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import {getPasswordResetEmailTemplate, getVerificationEmailTemplate, getWelcomeEmailTemplate} from "./templates/auth";
import {getPaymentRequestEmailTemplate} from "./templates/payment";

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

  async sendPaymentRequestEmail(data: {
    to: string;
    coachName: string;
    planName: string;
    planDescription?: string;
    amount: number;
    paymentLink: string;
    description?: string;
  }): Promise<void> {
    const subject = `Payment Request - ${data.planName} Plan Subscription`;
    const html = getPaymentRequestEmailTemplate(data);
    const text = `
    Hello ${data.coachName},

    You have received a payment request for the ${data.planName} plan subscription.

    Amount: $${data.amount}
    Plan: ${data.planName}
    ${data.description ? `Description: ${data.description}` : ''}

    To complete your payment, please click the link below:
    ${data.paymentLink}

    This secure payment link will take you to Stripe's payment page where you can safely enter your payment details.

    If you have any questions, please contact our support team.

    Best regards,
    The Next Level Coach AI Team
  `;

    await this.sendEmail(data.to, subject, html, text);
  }

  async sendLeadFollowupEmail(
    to: string,
    subject: string,
    html: string,
    coachName: string,
  ) {
    const text = html.replace(/<[^>]*>/g, '');
    return this.sendEmail(to, subject, html, text);
  }

  private personalizeEmailBody(body: string, leadName: string, coachName: string): string {
    return body
      .replace(/{{leadName}}/g, leadName)
      .replace(/{{coachName}}/g, coachName)
      .replace(/{{firstName}}/g, leadName.split(' ')[0]);
  }

  private convertToHtml(text: string): string {
    // Convert plain text to basic HTML
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Follow-up Email</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-header {
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .email-content {
      margin-bottom: 30px;
    }
    .email-footer {
      border-top: 1px solid #f0f0f0;
      padding-top: 20px;
      font-size: 14px;
      color: #666;
    }
    .cta-button {
      display: inline-block;
      background-color: #7B21BA;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="email-header">
    <h2 style="margin: 0; color: #7B21BA;">Personal Message</h2>
  </div>

  <div class="email-content">
    ${text.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
  </div>

  <div class="email-footer">
    <p>Best regards,<br>
    <strong>Your Coach</strong></p>
    <p><small>You're receiving this email because you expressed interest in coaching services.
    <a href="#" style="color: #666;">Unsubscribe</a></small></p>
  </div>
</body>
</html>`;
  }

  private async sendEmail(to: string, subject: string, html: string, text: string) {
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
      return result;
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
