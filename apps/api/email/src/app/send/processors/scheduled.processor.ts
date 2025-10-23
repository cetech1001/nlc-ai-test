import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ProvidersService } from '../services/providers.service';
import { SmtpService } from '../services/smtp.service';
import { EmailMessageStatus, EmailStatus, UserType } from '@nlc-ai/types';

@Processor('scheduled-emails')
export class ScheduledProcessor {
  private readonly logger = new Logger(ScheduledProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providers: ProvidersService,
    private readonly smtpService: SmtpService,
  ) {}

  @Process('process-scheduled-emails')
  async processScheduledEmails() {
    this.logger.log('Processing scheduled emails...');

    try {
      const now = new Date();
      const scheduledEmails = await this.prisma.emailMessage.findMany({
        where: {
          status: EmailStatus.SCHEDULED,
          scheduledFor: {
            lte: now,
          },
        },
        take: 100,
        orderBy: {
          scheduledFor: 'asc',
        },
        include: {
          emailThread: {
            include: {
              emailAccount: true,
            },
          },
        },
      });

      this.logger.log(`Found ${scheduledEmails.length} scheduled emails to process`);

      const results = await Promise.allSettled(
        scheduledEmails.map(email => this.sendScheduledEmail(email))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.logger.log(
        `Processed ${scheduledEmails.length} scheduled emails: ${successful} successful, ${failed} failed`
      );

      return {
        processed: scheduledEmails.length,
        successful,
        failed,
      };
    } catch (error) {
      this.logger.error('Failed to process scheduled emails:', error);
      throw error;
    }
  }

  private async sendScheduledEmail(email: any): Promise<void> {
    try {
      // Update status to processing
      await this.prisma.emailMessage.update({
        where: { id: email.id },
        data: { status: EmailStatus.PROCESSING },
      });

      // Determine how to send based on email type
      if (email.emailThread && email.emailThread.emailAccount) {
        // Thread reply - send via coach's connected account
        await this.sendViaCoachAccount(email);
      } else if (email.userType === UserType.COACH && email.recipientType) {
        // Coach email to client/lead - try coach account first
        await this.sendCoachEmail(email);
      } else {
        // System email - send via Mailgun
        await this.sendSystemEmail(email);
      }

      this.logger.log(`Successfully sent scheduled email: ${email.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to send scheduled email ${email.id}:`, error);

      // Update email with error
      await this.prisma.emailMessage.update({
        where: { id: email.id },
        data: {
          status: EmailStatus.FAILED,
          errorMessage: error.message,
          retryCount: { increment: 1 },
        },
      });

      // If retry count is less than 3, reschedule for retry
      if (email.retryCount < 3) {
        const retryDelay = Math.pow(2, email.retryCount) * 60 * 1000; // Exponential backoff
        const newScheduledFor = new Date(Date.now() + retryDelay);

        await this.prisma.emailMessage.update({
          where: { id: email.id },
          data: {
            status: EmailStatus.SCHEDULED,
            scheduledFor: newScheduledFor,
          },
        });

        this.logger.log(
          `Rescheduled failed email ${email.id} for retry at ${newScheduledFor}`
        );
      }

      throw error;
    }
  }

  private async sendViaCoachAccount(email: any): Promise<void> {
    const { emailThread } = email;

    const result = await this.smtpService.sendViaCoachAccount({
      accountID: emailThread.emailAccount.id,
      to: email.to,
      subject: email.subject || '',
      text: email.text || '',
      html: email.html || '',
      threadID: emailThread.threadID,
    });

    if (result.success) {
      await this.prisma.emailMessage.update({
        where: { id: email.id },
        data: {
          status: EmailStatus.SENT,
          providerMessageID: result.messageID,
          sentAt: new Date(),
        },
      });
    } else {
      throw new Error(result.error || 'Failed to send via coach account');
    }
  }

  private async sendCoachEmail(email: any): Promise<void> {
    // Try to find coach's primary email account
    const primaryAccount = await this.prisma.emailAccount.findFirst({
      where: {
        userID: email.userID,
        userType: UserType.COACH,
        isPrimary: true,
        isActive: true,
      },
    });

    if (primaryAccount) {
      const result = await this.smtpService.sendViaCoachAccount({
        accountID: primaryAccount.id,
        to: email.to,
        subject: email.subject || '',
        text: email.text || '',
        html: email.html || '',
      });

      if (result.success) {
        await this.prisma.emailMessage.update({
          where: { id: email.id },
          data: {
            status: EmailStatus.SENT,
            providerMessageID: result.messageID,
            sentAt: new Date(),
          },
        });
        return;
      }
    }

    // Fallback to system email if no coach account
    await this.sendSystemEmail(email);
  }

  private async sendSystemEmail(email: any): Promise<void> {
    const result = await this.providers.sendEmail(
      {
        to: email.to,
        subject: email.subject || '',
        text: email.text || '',
        html: email.html || '',
        templateID: email.emailTemplateID,
        metadata: {
          messageID: email.id,
          sequenceID: email.emailSequenceID,
          recipientID: email.recipientID,
          recipientType: email.recipientType,
          ...email.metadata,
        },
      }
    );

    if (result.status === EmailMessageStatus.SENT) {
      await this.prisma.emailMessage.update({
        where: { id: email.id },
        data: {
          status: EmailStatus.SENT,
          providerMessageID: result.providerMessageID,
          sentAt: new Date(),
        },
      });
    } else {
      throw new Error(result.error || 'Failed to send via system email');
    }
  }
}
