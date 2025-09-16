import {Body, Controller, Get, Logger, Param, Post} from '@nestjs/common';
import {ProvidersService} from './providers.service';
import {SendEmailDto} from './dto/send-email.dto';
import {SendBulkEmailsDto} from './dto/send-bulk-emails.dto';
import {type AuthUser, EmailMessageStatus, EmailProviderHealth, SendEmailResponse, UserType} from '@nlc-ai/types';
import {CurrentUser} from "@nlc-ai/api-auth";
import {ConfigService} from "@nestjs/config";

@Controller('providers')
export class ProvidersController {
  private readonly logger = new Logger(ProvidersController.name);

  constructor(
    private emailProviderService: ProvidersService,
    private readonly config: ConfigService,
  ) {}

  @Post('send')
  async sendEmail(
    @Body() dto: SendEmailDto,
    @CurrentUser() user: AuthUser,
  ): Promise<SendEmailResponse> {
    try {
      let sender: string = this.config.get('email.mailgun.from')!;

      if (user.type === UserType.COACH) {
        const primaryAccount = await this.emailProviderService.getPrimaryEmail(user.id);
        sender = primaryAccount || sender;
      }

      const result = await this.emailProviderService.sendEmail({
        to: dto.to,
        subject: dto.subject,
        text: dto.text,
        html: dto.html,
        cc: dto.cc,
        bcc: dto.bcc,
        attachments: dto.attachments,
        tags: dto.tags,
        metadata: dto.metadata,
        templateID: dto.templateID,
        templateVariables: dto.templateVariables,
      }, sender);

      if (result.status !== EmailMessageStatus.SENT && result.error) {
        throw result.error;
      }

      return {
        messageID: result.messageID,
        threadID: dto.threadID || '',
        providerMessageID: result.providerMessageID,
        status: result.status === EmailMessageStatus.SENT ? EmailMessageStatus.SENT : EmailMessageStatus.FAILED,
        scheduledFor: dto.scheduleFor,
        message: 'Email sent successfully',
      };
    } catch (error: any) {
      this.logger.error('Failed to send email', error);
      return {
        messageID: '',
        threadID: dto.threadID || '',
        status: EmailMessageStatus.FAILED,
        message: error.message,
      };
    }
  }

  @Post('send-bulk')
  async sendBulkEmails(
    @Body() dto: SendBulkEmailsDto,
    @CurrentUser() user: AuthUser,
  ) {
    let sender: string = this.config.get('email.mailgun.from')!;

    if (user.type === UserType.COACH) {
      const primaryAccount = await this.emailProviderService.getPrimaryEmail(user.id);
      sender = primaryAccount || sender;
    }

    try {
      const messages = dto.emails.map(email => ({
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
        cc: email.cc,
        bcc: email.bcc,
        attachments: email.attachments,
        tags: email.tags,
        metadata: email.metadata,
        templateID: email.templateID,
        templateVariables: email.templateVariables,
      }));

      const results = await this.emailProviderService.sendBulkEmails(messages, sender);

      const successCount = results.filter(r => r.status === EmailMessageStatus.SENT).length;
      const failedCount = results.length - successCount;

      return {
        totalSent: successCount,
        totalFailed: failedCount,
        results: results.map(r => ({
          messageID: r.messageID,
          status: r.status,
          error: r.error,
        })),
        message: `Sent ${successCount}/${results.length} emails successfully`,
      };
    } catch (error) {
      this.logger.error('Failed to send bulk emails', error);
      throw error;
    }
  }

  @Get('health')
  async getHealth(): Promise<EmailProviderHealth> {
    try {
      const health = await this.emailProviderService.getProviderHealth();

      return {
        isHealthy: health.isHealthy,
        provider: health.provider,
        responseTime: health.responseTime,
        lastChecked: health.lastChecked,
        errorRate: health.errorRate,
        quotaUsage: health.quotaUsage,
        issues: health.isHealthy ? [] : ['Provider connectivity issues'],
      };
    } catch (error: any) {
      this.logger.error('Failed to get provider health', error);
      return {
        isHealthy: false,
        provider: '',
        responseTime: 0,
        lastChecked: new Date().toISOString(),
        errorRate: 100,
        issues: [error.message],
      };
    }
  }

  @Get('delivery-status/:messageID')
  async getDeliveryStatus(@Param('messageID') messageID: string) {
    try {
      return await this.emailProviderService.getDeliveryStatus(messageID);
    } catch (error) {
      this.logger.error('Failed to get delivery status', error);
      throw error;
    }
  }
}
