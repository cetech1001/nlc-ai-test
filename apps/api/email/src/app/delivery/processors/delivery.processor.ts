import { Processor, Process } from '@nestjs/bull';
import { type Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ProvidersService } from '../../providers/providers.service';
import { EmailMessageStatus } from '@nlc-ai/types';

@Processor('email-delivery')
export class DeliveryProcessor {
  private readonly logger = new Logger(DeliveryProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providersService: ProvidersService,
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
      const fromEmail = emailThread.emailAccount?.emailAddress || message.from;

      const result = await this.providersService.sendEmail({
        to: message.to,
        subject: message.subject || '',
        text: message.text || '',
        html: message.html || '',
        metadata: {
          threadID: emailThread.threadID,
          messageID: message.id,
          type: 'thread_reply',
        },
      }, fromEmail);

      if (result.status === EmailMessageStatus.SENT) {
        await this.prisma.emailMessage.update({
          where: { id: messageID },
          data: {
            status: 'sent',
            providerMessageID: result.providerMessageID,
            sentAt: new Date(),
          },
        });

        this.logger.log(`Thread reply sent successfully: ${messageID}`);
      } else {
        throw new Error(result.error || 'Failed to send');
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
        include: {
          emailThread: {
            include: {
              emailAccount: true,
            },
          },
        },
      });

      if (!message) {
        throw new Error('Message not found');
      }

      // Get coach's primary email account
      const coachID = message.emailThread?.userID;
      let fromEmail = message.from;

      if (coachID) {
        const primaryAccount = await this.prisma.emailAccount.findFirst({
          where: { userID: coachID, isPrimary: true },
        });
        fromEmail = primaryAccount?.emailAddress || fromEmail;
      }

      const result = await this.providersService.sendEmail({
        to: message.to,
        subject: message.subject || '',
        text: message.text || '',
        html: message.html || '',
        templateID: message.emailTemplateID || '',
        metadata: {
          messageID: message.id,
          type: 'coach_email',
          coachID,
        },
      }, fromEmail);

      if (result.status === EmailMessageStatus.SENT) {
        await this.prisma.emailMessage.update({
          where: { id: messageID },
          data: {
            status: 'sent',
            providerMessageID: result.providerMessageID,
            sentAt: new Date(),
          },
        });

        this.logger.log(`Coach email sent successfully: ${messageID}`);
      } else {
        throw new Error(result.error || 'Failed to send');
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
}
