import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ProvidersService} from '../providers/providers.service';
import {
  getPaymentRequestEmailTemplate,
  getPaymentRequestText,
} from '../templates/templates';
import {EmailMessageStatus, SendEmailRequest} from "@nlc-ai/types";
import {ClientInvitedEvent} from "@nlc-ai/api-types";

@Injectable()
export class TransactionalService {
  private readonly logger = new Logger(TransactionalService.name);
  private readonly systemFromEmail: string;

  constructor(
    private readonly providers: ProvidersService,
    private readonly configService: ConfigService,
  ) {
    this.systemFromEmail =
      this.configService.get<string>('email.mailgun.fromEmail', 'noreply@nextlevelcoach.ai');
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    await this.sendSystemEmail({
      to: email,
      templateID: 'email_verification',
      templateVariables: {
        verificationCode: code,
      }
    });
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const baseUrl = this.configService.get<string>('email.platforms.coach', '');

    await this.sendSystemEmail({
      to: email,
      templateID: 'password_reset',
      templateVariables: {
        verificationCode: code,
        baseUrl,
        email,
      },
    });
  }

  async sendPasswordResetConfirmationEmail(email: string): Promise<void> {
    await this.sendSystemEmail({
      to: email,
      templateID: 'password_reset_success',
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const baseUrl = this.configService.get<string>('email.platforms.coach', '');

    await this.sendSystemEmail({
      to: email,
      templateID: 'welcome_coach',
      templateVariables: {
        name,
        baseUrl,
      },
    });
  }

  async sendClientInvitationEmail(payload: ClientInvitedEvent['payload']): Promise<void> {
    const baseUrl = this.configService.get<string>('email.platforms.client', '');
    const inviteUrl = `${baseUrl}/login?token=${payload.token}`;
    const expiryText = payload.expiresAt
      ? `This invitation expires on ${new Date(payload.expiresAt).toLocaleDateString()}.`
      : 'This invitation will expire in 7 days.';

    await this.sendSystemEmail({
      to: payload.email,
      templateID: 'client_invite',
      templateVariables: {
        inviteUrl,
        baseUrl,
        coachName: payload.coachName,
        expiryText,
        businessName: payload.businessName || `${payload.coachName}'s coaching program`,
        businessNameTagline: payload.businessName || 'Personal Coach',
        message: payload.message || 'N/A',
      },
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
      templateID: 'payment-request',
    });
  }

  async sendNotificationEmail(data: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    templateID?: string;
  }): Promise<void> {
    await this.sendSystemEmail({
      ...data,
      html: data.html || data.text,
      templateID: data.templateID || 'notification',
    });
  }

  private async sendSystemEmail(data: SendEmailRequest): Promise<void> {
    try {
      const result = await this.providers.sendEmail({
        ...data,
        metadata: {
          type: 'system',
          templateID: data.templateID,
        },
      }, this.systemFromEmail);

      if (result.status !== EmailMessageStatus.SENT) {
        throw new Error(result.error || 'Failed to send email');
      }

      this.logger.log(`System email sent successfully to ${data.to} (${data.templateID})`);
    } catch (error: any) {
      this.logger.error(`Failed to send system email to ${data.to}:`, error);
      throw error;
    }
  }
}
