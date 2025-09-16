import { Injectable, Inject, Logger } from '@nestjs/common';
import type {IEmailProvider, EmailDeliveryResult, SendEmailRequest} from '@nlc-ai/types';
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(
    @Inject('EMAIL_PROVIDER') private emailProvider: IEmailProvider,
    private readonly prisma: PrismaService,
  ) {}

  async sendEmail(message: SendEmailRequest, from: string): Promise<EmailDeliveryResult> {
    this.logger.log(`Sending email to: ${message.to}`);
    return this.emailProvider.sendEmail(message, from);
  }

  async sendBulkEmails(messages: SendEmailRequest[], from: string): Promise<EmailDeliveryResult[]> {
    this.logger.log(`Sending bulk emails: ${messages.length} messages`);
    return this.emailProvider.sendBulkEmails(messages, from);
  }

  async getProviderHealth() {
    return this.emailProvider.getHealth();
  }

  validateEmail(email: string): boolean {
    return this.emailProvider.validateEmail(email);
  }

  async getDeliveryStatus(messageID: string) {
    return this.emailProvider.getDeliveryStatus(messageID);
  }

  async getPrimaryEmail(userID: string) {
    const primaryAccount = await this.prisma.emailAccount.findFirst({
      where: {
        userID,
        isPrimary: true,
      }
    });
    return primaryAccount?.emailAddress;
  }
}
