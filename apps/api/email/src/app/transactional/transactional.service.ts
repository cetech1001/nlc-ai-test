import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ProvidersService} from '../providers/providers.service';
import {
  getPasswordResetEmailTemplate,
  getVerificationEmailTemplate,
  getWelcomeEmailTemplate,
  getPaymentRequestEmailTemplate,
  getPaymentRequestText, getLeadFollowupEmailTemplate,
} from '../templates/templates';
import {EmailDeliveryResult, EmailMessageStatus} from "@nlc-ai/types";

@Injectable()
export class TransactionalService {
  private readonly logger = new Logger(TransactionalService.name);
  private readonly systemFromEmail: string;

  constructor(
    private readonly providersService: ProvidersService,
    private readonly configService: ConfigService,
  ) {
    this.systemFromEmail = this.configService.get<string>('email.system.fromEmail') ||
      this.configService.get<string>('email.mailgun.fromEmail') ||
      'noreply@nextlevelcoach.ai';
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const subject = 'Verify Your Next Level Coach AI Account';
    const html = getVerificationEmailTemplate(code);
    const text = `Your verification code is: ${code}. This code expires in 10 minutes.`;

    await this.sendSystemEmail({
      to: email,
      subject,
      html,
      text,
      templateType: 'verification',
    });
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const subject = 'Reset Your Next Level Coach AI Password';
    const frontendURL = this.configService.get<string>('email.platforms.coach', '');
    const html = getPasswordResetEmailTemplate(code, frontendURL, email);
    const text = `Your password reset code is: ${code}. This code expires in 10 minutes.`;

    await this.sendSystemEmail({
      to: email,
      subject,
      html,
      text,
      templateType: 'password-reset',
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = 'Welcome to Next Level Coach AI!';
    const frontendURL = this.configService.get<string>('email.platforms.coach', '');
    const html = getWelcomeEmailTemplate(name, frontendURL);
    const text = `Welcome to Next Level Coach AI, ${name}! Your account has been successfully created.`;

    await this.sendSystemEmail({
      to: email,
      subject,
      html,
      text,
      templateType: 'welcome',
    });
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
    const text = getPaymentRequestText(data);

    await this.sendSystemEmail({
      to: data.to,
      subject,
      html,
      text,
      templateType: 'payment-request',
    });
  }

  async sendNotificationEmail(data: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    templateType?: string;
  }): Promise<void> {
    await this.sendSystemEmail({
      ...data,
      html: data.html || data.text,
      templateType: data.templateType || 'notification',
    });
  }

  async sendLeadEmail(data: {
    to: string;
    subject: string;
    emailContent: string;
    coachID: string;
    leadName: string;
    coachName: string;
    coachBusinessName?: string;
    emailNumber?: number;
    totalEmails?: number;
    unsubscribeLink?: string;
  }): Promise<EmailDeliveryResult> {
    const coachEmail = await this.providersService.getPrimaryEmail(data.coachID);

    const html = getLeadFollowupEmailTemplate(data);
    const text = data.emailContent.replace(/<[^>]*>/g, '');

    return this.providersService.sendEmail({
      to: data.to,
      subject: data.subject,
      html,
      text,
      templateID: 'lead-followup',
      metadata: {
        leadName: data.leadName,
        coachName: data.coachName,
        coachID: data.coachID,
        emailNumber: data.emailNumber,
        totalEmails: data.totalEmails,
        type: 'lead_sequence',
      },
    }, coachEmail || this.systemFromEmail);
  }

  private async sendSystemEmail(data: {
    to: string;
    subject: string;
    html: string;
    text: string;
    templateType: string;
  }): Promise<void> {
    try {
      const result = await this.providersService.sendEmail({
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
        templateID: data.templateType,
        metadata: {
          type: 'system',
          templateType: data.templateType,
        },
      }, this.systemFromEmail);

      if (result.status !== EmailMessageStatus.SENT) {
        throw new Error(result.error || 'Failed to send email');
      }

      this.logger.log(`System email sent successfully to ${data.to} (${data.templateType})`);
    } catch (error: any) {
      this.logger.error(`Failed to send system email to ${data.to}:`, error);
      throw error;
    }
  }
}
