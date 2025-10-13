import { Processor, Process } from '@nestjs/bull';
import { type Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ProvidersService } from '../services/providers.service';
import { SmtpService } from '../services/smtp.service';
import { EmailMessageStatus } from '@nlc-ai/types';

@Processor('email-delivery')
export class SendProcessor {
  private readonly logger = new Logger(SendProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providers: ProvidersService,
    private readonly smtpService: SmtpService,
  ) {}

  @Process('send-thread-reply')
  async processThreadReply(job: Job<{ messageID: string }>) {
    const { messageID } = job.data;

    try {
      const message = await this.prisma.emailMessage.findUnique({
        where: { id: messageID },
        include: {
          emailThread: {
            include: {
              emailAccount: true,
            },
          },
        },
      });

      if (!message || !message.emailThread) {
        throw new Error('Message or thread not found');
      }

      const { emailThread } = message;

      if (!emailThread.emailAccount) {
        throw new Error('No email account connected for this thread');
      }

      const result = await this.smtpService.sendViaCoachAccount({
        accountID: emailThread.emailAccount.id,
        to: message.to,
        subject: message.subject || '',
        text: message.text || '',
        html: message.html || '',
        threadID: emailThread.threadID,
      });

      if (result.success) {
        await this.prisma.emailMessage.update({
          where: { id: messageID },
          data: {
            status: 'sent',
            providerMessageID: result.messageID,
            sentAt: new Date(),
          },
        });

        this.logger.log(`Thread reply sent successfully via coach's account: ${messageID}`);
      } else {
        throw new Error(result.error || 'Failed to send via coach account');
      }

    } catch (error: any) {
      this.logger.error(`Failed to send thread reply ${messageID}:`, error);

      await this.prisma.emailMessage.update({
        where: { id: messageID },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  @Process('send-coach-email')
  async processCoachEmail(job: Job<{ messageID: string }>) {
    const { messageID } = job.data;

    try {
      const message = await this.prisma.emailMessage.findUnique({
        where: { id: messageID },
      });

      if (!message) {
        throw new Error('Message not found');
      }

      const primaryAccount = await this.prisma.emailAccount.findFirst({
        where: { userID: message.userID, isPrimary: true },
      });

      if (primaryAccount) {
        const result = await this.smtpService.sendViaCoachAccount({
          accountID: primaryAccount.id,
          to: message.to,
          subject: message.subject || '',
          text: message.text || '',
          html: message.html || '',
        });

        if (result.success) {
          await this.prisma.emailMessage.update({
            where: { id: messageID },
            data: {
              status: 'sent',
              providerMessageID: result.messageID,
              sentAt: new Date(),
            },
          });

          this.logger.log(`Coach email sent successfully via their account: ${messageID}`);
        } else {
          throw new Error(result.error || 'Failed to send via coach account');
        }
      } else {
        this.logger.warn(`No primary account for coach ${message.userID}, falling back to Mailgun`);

        const result = await this.providers.sendEmail({
          to: message.to,
          subject: message.subject || '',
          text: message.text || '',
          html: message.html || '',
          templateID: message.emailTemplateID || '',
          metadata: {
            messageID: message.id,
            type: 'coach_email',
            coachID: message.userID,
          },
        });

        if (result.status === EmailMessageStatus.SENT) {
          await this.prisma.emailMessage.update({
            where: { id: messageID },
            data: {
              status: 'sent',
              providerMessageID: result.providerMessageID,
              sentAt: new Date(),
            },
          });

          this.logger.log(`Coach email sent successfully via Mailgun: ${messageID}`);
        } else {
          throw new Error(result.error || 'Failed to send via Mailgun');
        }
      }

    } catch (error: any) {
      this.logger.error(`Failed to send coach email ${messageID}:`, error);

      await this.prisma.emailMessage.update({
        where: { id: messageID },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  @Process('send-admin-email')
  async processAdminEmail(job: Job<{ messageID: string }>) {
    const { messageID } = job.data;

    try {
      const message = await this.prisma.emailMessage.findUnique({
        where: { id: messageID },
      });

      if (!message) {
        throw new Error('Message not found');
      }

      const result = await this.providers.sendEmail({
        to: message.to,
        subject: message.subject || '',
        text: message.text || '',
        html: message.html || '',
        templateID: message.emailTemplateID || '',
        metadata: {
          messageID: message.id,
          type: 'admin_email',
          ...(message.metadata as any),
        },
      });

      if (result.status === EmailMessageStatus.SENT) {
        await this.prisma.emailMessage.update({
          where: { id: messageID },
          data: {
            status: 'sent',
            providerMessageID: result.providerMessageID,
            sentAt: new Date(),
          },
        });

        this.logger.log(`Admin email sent successfully: ${messageID}`);
      } else {
        throw new Error(result.error || 'Failed to send');
      }

    } catch (error: any) {
      this.logger.error(`Failed to send admin email ${messageID}:`, error);

      await this.prisma.emailMessage.update({
        where: { id: messageID },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }
}
