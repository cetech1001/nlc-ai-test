import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@nlc-ai/api-database';
import { EmailService } from './email.service';
import { OutboxService } from '@nlc-ai/api-messaging';

interface EmailDeliveryResult {
  success: boolean;
  messageID?: string;
  error?: string;
}

@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);
  private readonly batchSize: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly outbox: OutboxService,
  ) {
    this.batchSize = parseInt(process.env.EMAIL_BATCH_SIZE || '50');
    this.maxRetries = parseInt(process.env.EMAIL_MAX_RETRIES || '3');
    this.retryDelay = parseInt(process.env.EMAIL_RETRY_DELAY_MINUTES || '30');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processScheduledEmails() {
    this.logger.log('Processing scheduled emails...');

    try {
      const emailsToSend = await this.getEmailsToSend();

      if (emailsToSend.length === 0) {
        return;
      }

      this.logger.log(`Processing ${emailsToSend.length} scheduled emails`);

      // Process emails in parallel with concurrency control
      const promises = emailsToSend.map(email => this.processIndividualEmail(email));
      await Promise.allSettled(promises);

      this.logger.log('Finished processing scheduled emails');
    } catch (error) {
      this.logger.error('Error in processScheduledEmails:', error);
    }
  }

  private async getEmailsToSend() {
    return this.prisma.scheduledEmail.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: new Date(),
        },
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
          },
        },
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
            isActive: true,
          },
        },
        emailSequence: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
      take: this.batchSize,
      orderBy: { scheduledFor: 'asc' },
    });
  }

  private async processIndividualEmail(scheduledEmail: any): Promise<void> {
    const emailID = scheduledEmail.id;

    try {
      // Mark as processing to prevent duplicate sends
      await this.prisma.scheduledEmail.update({
        where: { id: emailID },
        data: { status: 'processing' },
      });

      // Validate email can be sent
      const validation = await this.validateEmailDelivery(scheduledEmail);
      if (!validation.canSend) {
        await this.markEmailAsCancelled(emailID, validation.reason!);
        return;
      }

      // Send the email
      const result = await this.sendScheduledEmail(scheduledEmail);

      if (result.success) {
        await this.handleSuccessfulDelivery(scheduledEmail, result);
      } else {
        await this.handleFailedDelivery(scheduledEmail, result);
      }
    } catch (error: any) {
      this.logger.error(`Error processing scheduled email ${emailID}:`, error);
      await this.handleFailedDelivery(scheduledEmail, {
        success: false,
        error: error.message,
      });
    }
  }

  private async validateEmailDelivery(scheduledEmail: any): Promise<{ canSend: boolean; reason?: string }> {
    // Check if coach is active
    if (scheduledEmail.coach && !scheduledEmail.coach.isActive) {
      return { canSend: false, reason: 'Coach account is inactive' };
    }

    // Check if client is active (for client emails)
    if (scheduledEmail.client && !scheduledEmail.client.isActive) {
      return { canSend: false, reason: 'Client account is inactive' };
    }

    // Check if email sequence is still active
    if (scheduledEmail.emailSequence && !scheduledEmail.emailSequence.isActive) {
      return { canSend: false, reason: 'Email sequence is no longer active' };
    }

    // Check for lead status (for lead emails)
    if (scheduledEmail.lead && scheduledEmail.lead.status === 'unsubscribed') {
      return { canSend: false, reason: 'Lead has unsubscribed' };
    }

    // Additional validation for duplicate prevention
    const recentSimilarEmail = await this.checkForRecentDuplicates(scheduledEmail);
    if (recentSimilarEmail) {
      return { canSend: false, reason: 'Similar email sent recently' };
    }

    return { canSend: true };
  }

  private async checkForRecentDuplicates(scheduledEmail: any): Promise<boolean> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const duplicateCheck = await this.prisma.scheduledEmail.findFirst({
      where: {
        id: { not: scheduledEmail.id },
        subject: scheduledEmail.subject,
        status: 'sent',
        sentAt: { gte: oneDayAgo },
        ...(scheduledEmail.leadID && { leadID: scheduledEmail.leadID }),
        ...(scheduledEmail.clientID && { clientID: scheduledEmail.clientID }),
      },
    });

    return !!duplicateCheck;
  }

  private async sendScheduledEmail(scheduledEmail: any): Promise<EmailDeliveryResult> {
    const recipient = scheduledEmail.lead || scheduledEmail.client;
    if (!recipient) {
      return { success: false, error: 'No valid recipient found' };
    }

    const recipientEmail = recipient.email;
    const recipientName = scheduledEmail.lead
      ? recipient.name
      : `${recipient.firstName} ${recipient.lastName}`;

    const coachName = `${scheduledEmail.coach.firstName} ${scheduledEmail.coach.lastName}`;

    try {
      let result;

      if (scheduledEmail.leadID) {
        // Lead follow-up email
        result = await this.emailService.sendLeadFollowupEmail(
          recipientEmail,
          scheduledEmail.subject,
          scheduledEmail.body,
          coachName,
          recipientName,
          scheduledEmail.coach.businessName,
          scheduledEmail.sequenceOrder,
          undefined, // totalEmails - we could calculate this if needed
          this.generateUnsubscribeLink(scheduledEmail.leadID)
        );
      } else if (scheduledEmail.clientID) {
        // Client response email
        result = await this.emailService.sendClientResponseEmail(
          recipientEmail,
          scheduledEmail.subject,
          scheduledEmail.body,
          coachName,
          recipientName,
          scheduledEmail.coach.businessName
        );
      } else {
        return { success: false, error: 'Unknown email type' };
      }

      return {
        success: result.status === 200,
        messageID: result.messageID,
        error: result.status !== 200 ? result.message : undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async handleSuccessfulDelivery(scheduledEmail: any, result: EmailDeliveryResult): Promise<void> {
    const emailID = scheduledEmail.id;

    // Update scheduled email status
    await this.prisma.scheduledEmail.update({
      where: { id: emailID },
      data: {
        status: 'sent',
        sentAt: new Date(),
        providerMessageID: result.messageID,
        // @ts-ignore
        errorMessage: null,
      },
    });

    // Update recipient's last contacted timestamp
    if (scheduledEmail.leadID) {
      await this.prisma.lead.update({
        where: { id: scheduledEmail.leadID },
        data: { lastContactedAt: new Date() },
      });
    } else if (scheduledEmail.clientID) {
      await this.prisma.client.update({
        where: { id: scheduledEmail.clientID },
        data: { lastInteractionAt: new Date() },
      });
    }

    // Emit success event
    await this.outbox.saveAndPublishEvent(
      {
        eventType: 'email.scheduled.sent',
        schemaVersion: 1,
        payload: {
          scheduledEmailID: emailID,
          providerMessageID: result.messageID,
          recipientEmail: scheduledEmail.lead?.email || scheduledEmail.client?.email,
          coachID: scheduledEmail.coachID,
          sentAt: new Date().toISOString(),
        },
      },
      'email.scheduled.sent'
    );

    this.logger.log(`Email sent successfully to ${scheduledEmail.lead?.email || scheduledEmail.client?.email}`);
  }

  private async handleFailedDelivery(scheduledEmail: any, result: EmailDeliveryResult): Promise<void> {
    const emailID = scheduledEmail.id;
    const currentRetryCount = scheduledEmail.retryCount || 0;

    if (currentRetryCount < this.maxRetries) {
      // Schedule retry
      const retryAt = new Date(Date.now() + this.retryDelay * 60 * 1000);

      await this.prisma.scheduledEmail.update({
        where: { id: emailID },
        data: {
          status: 'scheduled',
          scheduledFor: retryAt,
          errorMessage: JSON.stringify({
            error: result.error,
            retryCount: currentRetryCount + 1,
            originalScheduledFor: scheduledEmail.scheduledFor,
          }),
        },
      });

      this.logger.warn(`Scheduling retry for email ${emailID} at ${retryAt}. Attempt ${currentRetryCount + 1}/${this.maxRetries}`);
    } else {
      // Mark as permanently failed
      await this.prisma.scheduledEmail.update({
        where: { id: emailID },
        data: {
          status: 'failed',
          errorMessage: JSON.stringify({
            error: result.error,
            retryCount: currentRetryCount,
            finalFailure: true,
          }),
        },
      });

      // Emit failure event
      await this.outbox.saveAndPublishEvent(
        {
          eventType: 'email.scheduled.failed',
          schemaVersion: 1,
          payload: {
            scheduledEmailID: emailID,
            recipientEmail: scheduledEmail.lead?.email || scheduledEmail.client?.email,
            coachID: scheduledEmail.coachID,
            error: result.error,
            retryCount: currentRetryCount,
            failedAt: new Date().toISOString(),
          },
        },
        'email.scheduled.failed'
      );

      this.logger.error(`Email permanently failed for ${scheduledEmail.lead?.email || scheduledEmail.client?.email}: ${result.error}`);
    }
  }

  private async markEmailAsCancelled(emailID: string, reason: string): Promise<void> {
    await this.prisma.scheduledEmail.update({
      where: { id: emailID },
      data: {
        status: 'cancelled',
        errorMessage: JSON.stringify({ reason, cancelledAt: new Date() }),
      },
    });

    this.logger.log(`Email ${emailID} cancelled: ${reason}`);
  }

  private generateUnsubscribeLink(leadID: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'https://app.nextlevelcoach.ai';
    return `${baseUrl}/unsubscribe?leadId=${leadID}`;
  }

  // Email sequence management
  async pauseSequenceForLead(leadID: string): Promise<{ pausedCount: number }> {
    const result = await this.prisma.scheduledEmail.updateMany({
      where: {
        leadID,
        status: 'scheduled',
      },
      data: {
        status: 'paused',
      },
    });

    this.logger.log(`Paused ${result.count} emails for lead ${leadID}`);
    return { pausedCount: result.count };
  }

  async resumeSequenceForLead(leadID: string): Promise<{ resumedCount: number }> {
    const result = await this.prisma.scheduledEmail.updateMany({
      where: {
        leadID,
        status: 'paused',
      },
      data: {
        status: 'scheduled',
      },
    });

    this.logger.log(`Resumed ${result.count} emails for lead ${leadID}`);
    return { resumedCount: result.count };
  }

  async cancelSequenceForLead(leadID: string): Promise<{ cancelledCount: number }> {
    const result = await this.prisma.scheduledEmail.updateMany({
      where: {
        leadID,
        status: { in: ['scheduled', 'paused'] },
      },
      data: {
        status: 'cancelled',
      },
    });

    this.logger.log(`Cancelled ${result.count} emails for lead ${leadID}`);
    return { cancelledCount: result.count };
  }

  // Client email sequence management
  async pauseSequenceForClient(clientID: string): Promise<{ pausedCount: number }> {
    const result = await this.prisma.scheduledEmail.updateMany({
      where: {
        clientID,
        status: 'scheduled',
      },
      data: {
        status: 'paused',
      },
    });

    this.logger.log(`Paused ${result.count} emails for client ${clientID}`);
    return { pausedCount: result.count };
  }

  async resumeSequenceForClient(clientID: string): Promise<{ resumedCount: number }> {
    const result = await this.prisma.scheduledEmail.updateMany({
      where: {
        clientID,
        status: 'paused',
      },
      data: {
        status: 'scheduled',
      },
    });

    this.logger.log(`Resumed ${result.count} emails for client ${clientID}`);
    return { resumedCount: result.count };
  }

  async cancelSequenceForClient(clientID: string): Promise<{ cancelledCount: number }> {
    const result = await this.prisma.scheduledEmail.updateMany({
      where: {
        clientID,
        status: { in: ['scheduled', 'paused'] },
      },
      data: {
        status: 'cancelled',
      },
    });

    this.logger.log(`Cancelled ${result.count} emails for client ${clientID}`);
    return { cancelledCount: result.count };
  }

  // Daily cleanup and maintenance
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldEmails() {
    this.logger.log('Cleaning up old email records...');

    try {
      const retentionDays = parseInt(process.env.EMAIL_RETENTION_DAYS || '90');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.scheduledEmail.deleteMany({
        where: {
          status: { in: ['sent', 'failed', 'cancelled'] },
          OR: [
            { sentAt: { lt: cutoffDate } },
            {
              status: { in: ['failed', 'cancelled'] },
              updatedAt: { lt: cutoffDate }
            },
          ],
        },
      });

      this.logger.log(`Cleaned up ${result.count} old scheduled email records`);
    } catch (error) {
      this.logger.error('Error cleaning up old emails:', error);
    }
  }

  // Statistics and monitoring
  async getEmailStats(): Promise<{
    scheduled: number;
    processing: number;
    sent: number;
    failed: number;
    paused: number;
    cancelled: number;
    total: number;
  }> {
    const [scheduled, processing, sent, failed, paused, cancelled] = await Promise.all([
      this.prisma.scheduledEmail.count({ where: { status: 'scheduled' } }),
      this.prisma.scheduledEmail.count({ where: { status: 'processing' } }),
      this.prisma.scheduledEmail.count({ where: { status: 'sent' } }),
      this.prisma.scheduledEmail.count({ where: { status: 'failed' } }),
      this.prisma.scheduledEmail.count({ where: { status: 'paused' } }),
      this.prisma.scheduledEmail.count({ where: { status: 'cancelled' } }),
    ]);

    const total = scheduled + processing + sent + failed + paused + cancelled;

    return {
      scheduled,
      processing,
      sent,
      failed,
      paused,
      cancelled,
      total,
    };
  }

  async getCoachEmailStats(coachID: string, days: number = 30): Promise<{
    sentCount: number;
    failedCount: number;
    scheduledCount: number;
    openRate: number;
    clickRate: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [sentCount, failedCount, scheduledCount] = await Promise.all([
      this.prisma.scheduledEmail.count({
        where: {
          coachID,
          status: 'sent',
          sentAt: { gte: startDate },
        },
      }),
      this.prisma.scheduledEmail.count({
        where: {
          coachID,
          status: 'failed',
          updatedAt: { gte: startDate },
        },
      }),
      this.prisma.scheduledEmail.count({
        where: {
          coachID,
          status: 'scheduled',
        },
      }),
    ]);

    // Get analytics data from email service
    const emailStats = await this.emailService.getEmailStats(coachID, {
      start: startDate,
      end: new Date(),
    });

    return {
      sentCount,
      failedCount,
      scheduledCount,
      openRate: emailStats.openRate,
      clickRate: emailStats.clickRate,
    };
  }

  // Manual retry operations
  async retryFailedEmails(coachID?: string, limit: number = 10): Promise<{ retriedCount: number }> {
    const whereClause: any = {
      status: 'failed',
      updatedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Only retry from last 24 hours
      },
    };

    if (coachID) {
      whereClause.coachID = coachID;
    }

    const failedEmails = await this.prisma.scheduledEmail.findMany({
      where: whereClause,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    let retriedCount = 0;

    for (const email of failedEmails) {
      try {
        // Reset to scheduled status with immediate send time
        await this.prisma.scheduledEmail.update({
          where: { id: email.id },
          data: {
            status: 'scheduled',
            scheduledFor: new Date(Date.now() + 1000), // Send in 1 second
            // @ts-ignore
            errorMessage: null,
          },
        });
        retriedCount++;
      } catch (error) {
        this.logger.error(`Failed to schedule retry for email ${email.id}:`, error);
      }
    }

    this.logger.log(`Scheduled ${retriedCount} failed emails for retry`);
    return { retriedCount };
  }

  // Health monitoring
  async getSystemHealth(): Promise<{
    isHealthy: boolean;
    pendingEmails: number;
    processingEmails: number;
    recentFailureRate: number;
    avgProcessingTime: number;
    lastProcessedAt?: Date;
    issues: string[];
  }> {
    const issues: string[] = [];

    const [pendingEmails, processingEmails, recentStats] = await Promise.all([
      this.prisma.scheduledEmail.count({ where: { status: 'scheduled' } }),
      this.prisma.scheduledEmail.count({ where: { status: 'processing' } }),
      this.getRecentProcessingStats(),
    ]);

    // Check for concerning patterns
    if (pendingEmails > 1000) {
      issues.push(`High pending email count: ${pendingEmails}`);
    }

    if (processingEmails > 100) {
      issues.push(`Many emails stuck processing: ${processingEmails}`);
    }

    if (recentStats.failureRate > 10) {
      issues.push(`High failure rate: ${recentStats.failureRate}%`);
    }

    if (recentStats.avgProcessingTime > 30000) { // 30 seconds
      issues.push(`Slow processing time: ${recentStats.avgProcessingTime}ms`);
    }

    const isHealthy = issues.length === 0;

    return {
      isHealthy,
      pendingEmails,
      processingEmails,
      recentFailureRate: recentStats.failureRate,
      avgProcessingTime: recentStats.avgProcessingTime,
      lastProcessedAt: recentStats.lastProcessedAt,
      issues,
    };
  }

  private async getRecentProcessingStats(): Promise<{
    failureRate: number;
    avgProcessingTime: number;
    lastProcessedAt?: Date;
  }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [totalRecent, failedRecent, lastProcessed] = await Promise.all([
      this.prisma.scheduledEmail.count({
        where: {
          updatedAt: { gte: oneHourAgo },
          status: { in: ['sent', 'failed'] },
        },
      }),
      this.prisma.scheduledEmail.count({
        where: {
          updatedAt: { gte: oneHourAgo },
          status: 'failed',
        },
      }),
      this.prisma.scheduledEmail.findFirst({
        where: {
          status: { in: ['sent', 'failed'] },
        },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ]);

    const failureRate = totalRecent > 0 ? (failedRecent / totalRecent) * 100 : 0;

    // Calculate average processing time (simplified - you could make this more sophisticated)
    const recentProcessedEmails = await this.prisma.scheduledEmail.findMany({
      where: {
        status: 'sent',
        sentAt: { gte: oneHourAgo },
        // @ts-ignore
        scheduledFor: { not: null },
      },
      select: {
        scheduledFor: true,
        sentAt: true,
      },
      take: 100,
    });

    let totalProcessingTime = 0;
    let processedCount = 0;

    recentProcessedEmails.forEach(email => {
      if (email.scheduledFor && email.sentAt) {
        const processingTime = email.sentAt.getTime() - email.scheduledFor.getTime();
        if (processingTime > 0 && processingTime < 300000) { // Ignore outliers > 5 minutes
          totalProcessingTime += processingTime;
          processedCount++;
        }
      }
    });

    const avgProcessingTime = processedCount > 0 ? totalProcessingTime / processedCount : 0;

    return {
      failureRate: Math.round(failureRate * 100) / 100,
      avgProcessingTime: Math.round(avgProcessingTime),
      lastProcessedAt: lastProcessed?.updatedAt,
    };
  }

  // Emergency operations
  async pauseAllEmailsForCoach(coachID: string, reason: string): Promise<{ pausedCount: number }> {
    const result = await this.prisma.scheduledEmail.updateMany({
      where: {
        coachID,
        status: 'scheduled',
      },
      data: {
        status: 'paused',
        errorMessage: JSON.stringify({
          reason: `Emergency pause: ${reason}`,
          pausedAt: new Date(),
        }),
      },
    });

    await this.outbox.saveAndPublishEvent(
      {
        eventType: 'email.emergency.paused',
        schemaVersion: 1,
        payload: {
          coachID,
          reason,
          pausedCount: result.count,
          pausedAt: new Date().toISOString(),
        },
      },
      'email.emergency.paused'
    );

    this.logger.warn(`Emergency pause for coach ${coachID}: ${result.count} emails paused. Reason: ${reason}`);
    return { pausedCount: result.count };
  }

  async resumeAllEmailsForCoach(coachID: string): Promise<{ resumedCount: number }> {
    const result = await this.prisma.scheduledEmail.updateMany({
      where: {
        coachID,
        status: 'paused',
      },
      data: {
        status: 'scheduled',
        // @ts-ignore
        errorMessage: null,
      },
    });

    this.logger.log(`Resumed ${result.count} emails for coach ${coachID}`);
    return { resumedCount: result.count };
  }
}
