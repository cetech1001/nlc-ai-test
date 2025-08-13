import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processScheduledEmails() {
    this.logger.log('Processing scheduled emails...');

    try {
      const emailsToSend = await this.prisma.scheduledEmail.findMany({
        where: {
          status: 'scheduled',
          scheduledFor: {
            lte: new Date(),
          },
        },
        include: {
          lead: true,
          coach: true,
        },
        take: 50, // Process in batches to avoid overwhelming the system
      });

      if (emailsToSend.length === 0) {
        this.logger.log('No scheduled emails to process');
        return;
      }

      this.logger.log(`Processing ${emailsToSend.length} scheduled emails`);

      for (const scheduledEmail of emailsToSend) {
        try {
          // Mark as processing to avoid duplicate sends
          await this.prisma.scheduledEmail.update({
            where: { id: scheduledEmail.id },
            data: { status: 'processing' },
          });

          const result = await this.emailService.sendLeadFollowupEmail(
            scheduledEmail.lead.email,
            scheduledEmail.subject,
            scheduledEmail.body,
            `${scheduledEmail.coach.firstName} ${scheduledEmail.coach.lastName}`,
            // `${scheduledEmail.lead.firstName} ${scheduledEmail.lead.lastName}`,
            // scheduledEmail.coach.email,
          );

          this.logger.log(result);

          if (result.status === 200) {
            await this.prisma.scheduledEmail.update({
              where: { id: scheduledEmail.id },
              data: {
                status: 'sent',
                sentAt: new Date(),
                providerMessageID: result.messageID,
              },
            });

            // Update lead's last contacted timestamp
            await this.prisma.lead.update({
              where: { id: scheduledEmail.leadID },
              data: { lastContactedAt: new Date() },
            });

            this.logger.log(`Email sent successfully to ${scheduledEmail.lead.email}`);
          } else {
            await this.prisma.scheduledEmail.update({
              where: { id: scheduledEmail.id },
              data: {
                status: 'failed',
                errorMessage: result.message,
              },
            });

            this.logger.error(`Failed to send email to ${scheduledEmail.lead.email}: ${result.message}`);
          }
        } catch (error: any) {
          this.logger.error(`Error processing scheduled email ${scheduledEmail.id}:`, error);

          await this.prisma.scheduledEmail.update({
            where: { id: scheduledEmail.id },
            data: {
              status: 'failed',
              errorMessage: error.message,
            },
          });
        }
      }

      this.logger.log(`Finished processing scheduled emails`);
    } catch (error) {
      this.logger.error('Error in processScheduledEmails:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldEmails() {
    this.logger.log('Cleaning up old email records...');

    try {
      // Delete sent emails older than 90 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      const result = await this.prisma.scheduledEmail.deleteMany({
        where: {
          status: 'sent',
          sentAt: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} old email records`);
    } catch (error) {
      this.logger.error('Error cleaning up old emails:', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async retryFailedEmails() {
    this.logger.log('Retrying failed emails...');

    try {
      // Find failed emails that are less than 24 hours old and haven't been retried more than 3 times
      const failedEmails = await this.prisma.scheduledEmail.findMany({
        where: {
          status: 'failed',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          },
          // Add a retry count field to track this
        },
        include: {
          lead: true,
          coach: true,
        },
        take: 10, // Limit retries per hour
      });

      for (const email of failedEmails) {
        try {
          const result = await this.emailService.sendLeadFollowupEmail(
            email.lead.email,
            email.subject,
            email.body,
            `${email.coach.firstName} ${email.coach.lastName}`,
            // `${email.lead.firstName} ${email.lead.lastName}`,
            // email.coach.email,
          );

          console.log("Result: ", result);

          if (result.status === 200) {
            await this.prisma.scheduledEmail.update({
              where: { id: email.id },
              data: {
                status: 'sent',
                sentAt: new Date(),
                providerMessageID: result.messageID,
                errorMessage: null,
              },
            });

            this.logger.log(`Retry successful for email to ${email.lead.email}`);
          } else {
            this.logger.error(`Retry failed for email to ${email.lead.email}: ${result.message}`);
          }
        } catch (error) {
          this.logger.error(`Error retrying email ${email.id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error in retryFailedEmails:', error);
    }
  }

  async pauseSequenceForLead(leadID: string) {
    await this.prisma.scheduledEmail.updateMany({
      where: {
        leadID,
        status: 'scheduled',
      },
      data: {
        status: 'paused',
      },
    });

    this.logger.log(`Paused email sequence for lead ${leadID}`);
  }

  async resumeSequenceForLead(leadID: string) {
    await this.prisma.scheduledEmail.updateMany({
      where: {
        leadID,
        status: 'paused',
      },
      data: {
        status: 'scheduled',
      },
    });

    this.logger.log(`Resumed email sequence for lead ${leadID}`);
  }

  async cancelSequenceForLead(leadID: string) {
    await this.prisma.scheduledEmail.updateMany({
      where: {
        leadID,
        status: { in: ['scheduled', 'paused'] },
      },
      data: {
        status: 'cancelled',
      },
    });

    this.logger.log(`Cancelled email sequence for lead ${leadID}`);
  }

  async getEmailStats() {
    const [scheduled, sent, failed, processing] = await Promise.all([
      this.prisma.scheduledEmail.count({ where: { status: 'scheduled' } }),
      this.prisma.scheduledEmail.count({ where: { status: 'sent' } }),
      this.prisma.scheduledEmail.count({ where: { status: 'failed' } }),
      this.prisma.scheduledEmail.count({ where: { status: 'processing' } }),
    ]);

    return {
      scheduled,
      sent,
      failed,
      processing,
      total: scheduled + sent + failed + processing,
    };
  }
}
