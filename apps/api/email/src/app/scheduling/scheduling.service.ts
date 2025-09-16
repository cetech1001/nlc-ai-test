import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { OutboxService } from '@nlc-ai/api-messaging';
import { EmailEvent } from '@nlc-ai/api-types';
import { SchedulingRepository } from './repositories/scheduling.repository';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);
  private readonly batchSize: number;

  constructor(
    @InjectQueue('email-scheduling') private schedulingQueue: Queue,
    private readonly repository: SchedulingRepository,
    private readonly outbox: OutboxService,
  ) {
    this.batchSize = parseInt(process.env.EMAIL_SCHEDULING_BATCH_SIZE || '50');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processScheduledEmails() {
    this.logger.log('Processing scheduled emails...');

    try {
      const emailsToSend = await this.repository.getEmailsReadyToSend(this.batchSize);

      if (emailsToSend.length === 0) {
        return;
      }

      this.logger.log(`Found ${emailsToSend.length} emails ready to send`);

      // Process in parallel but limit concurrency
      const promises = emailsToSend.map(email =>
        this.schedulingQueue.add('process-scheduled-email', { emailID: email.id })
      );

      await Promise.allSettled(promises);

      this.logger.log('Finished queuing scheduled emails for processing');
    } catch (error) {
      this.logger.error('Error in processScheduledEmails:', error);
    }
  }

  // Schedule a single email
  async scheduleEmail(data: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    scheduledFor: Date;
    coachID?: string;
    clientID?: string;
    leadID?: string;
    emailThreadID?: string;
    emailSequenceID?: string;
    sequenceOrder?: number;
    templateID?: string;
    metadata?: Record<string, any>;
  }): Promise<{ emailID: string; scheduledFor: Date }> {
    const email = await this.repository.createScheduledEmail({
      ...data,
      status: 'scheduled',
    });

    /*await this.outbox.saveAndPublishEvent<EmailEvent>(
      {
        eventType: 'email.scheduled.created',
        schemaVersion: 1,
        payload: {
          emailID: email.id,
          scheduledFor: data.scheduledFor.toISOString(),
          coachID: data.coachID,
          leadID: data.leadID,
          clientID: data.clientID,
          sequenceOrder: data.sequenceOrder,
          emailSequenceID: data.emailSequenceID,
          createdAt: new Date().toISOString(),
        },
      },
      'email.scheduled.created'
    );*/

    return { emailID: email.id, scheduledFor: data.scheduledFor };
  }

  // Schedule bulk emails
  async scheduleBulkEmails(emails: Array<{
    to: string;
    subject: string;
    text?: string;
    html?: string;
    scheduledFor: Date;
    coachID?: string;
    clientID?: string;
    leadID?: string;
    templateID?: string;
    metadata?: Record<string, any>;
  }>): Promise<{ scheduledCount: number; errors: Array<{ email: string; error: string }> }> {
    let scheduledCount = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (const emailData of emails) {
      try {
        await this.scheduleEmail(emailData);
        scheduledCount++;
      } catch (error: any) {
        errors.push({
          email: emailData.to,
          error: error.message,
        });
      }
    }

    return { scheduledCount, errors };
  }

  async pauseSequenceForLead(leadID: string): Promise<{ pausedCount: number }> {
    const result = await this.repository.updateEmailsByLead(leadID, 'scheduled', {
      status: 'paused',
    });

    this.logger.log(`Paused ${result.count} emails for lead ${leadID}`);
    return { pausedCount: result.count };
  }

  async resumeSequenceForLead(leadID: string): Promise<{ resumedCount: number }> {
    const result = await this.repository.updateEmailsByLead(leadID, 'paused', {
      status: 'scheduled',
    });

    this.logger.log(`Resumed ${result.count} emails for lead ${leadID}`);
    return { resumedCount: result.count };
  }

  async cancelSequenceForLead(leadID: string, reason?: string): Promise<{ cancelledCount: number }> {
    const result = await this.repository.updateEmailsByLead(leadID, ['scheduled', 'paused'], {
      status: 'cancelled',
      metadata: { cancelReason: reason, cancelledAt: new Date() },
    });

    this.logger.log(`Cancelled ${result.count} emails for lead ${leadID}`);
    return { cancelledCount: result.count };
  }

  async pauseSequenceForClient(clientID: string): Promise<{ pausedCount: number }> {
    const result = await this.repository.updateEmailsByClient(clientID, 'scheduled', {
      status: 'paused',
    });

    return { pausedCount: result.count };
  }

  async resumeSequenceForClient(clientID: string): Promise<{ resumedCount: number }> {
    const result = await this.repository.updateEmailsByClient(clientID, 'paused', {
      status: 'scheduled',
    });

    return { resumedCount: result.count };
  }

  async cancelSequenceForClient(clientID: string): Promise<{ cancelledCount: number }> {
    const result = await this.repository.updateEmailsByClient(clientID, ['scheduled', 'paused'], {
      status: 'cancelled',
    });

    return { cancelledCount: result.count };
  }

  async pauseAllEmailsForCoach(coachID: string, reason: string): Promise<{ pausedCount: number }> {
    const result = await this.repository.updateEmailsByCoach(coachID, 'scheduled', {
      status: 'paused',
      metadata: { pauseReason: reason, pausedAt: new Date() },
    });

    await this.outbox.saveAndPublishEvent<EmailEvent>(
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

    return { pausedCount: result.count };
  }

  async resumeAllEmailsForCoach(coachID: string): Promise<{ resumedCount: number }> {
    const result = await this.repository.updateEmailsByCoach(coachID, 'paused', {
      status: 'scheduled',
      metadata: {},
    });

    return { resumedCount: result.count };
  }

  async retryFailedEmails(coachID?: string, limit: number = 10): Promise<{ retriedCount: number }> {
    const failedEmails = await this.repository.getFailedEmails(coachID, limit);

    let retriedCount = 0;

    for (const email of failedEmails) {
      try {
        await this.repository.updateEmail(email.id, {
          status: 'scheduled',
          scheduledFor: new Date(Date.now() + 60000), // Retry in 1 minute
          retryCount: (email.retryCount || 0) + 1,
          errorMessage: null,
        });
        retriedCount++;
      } catch (error) {
        this.logger.error(`Failed to schedule retry for email ${email.id}:`, error);
      }
    }

    return { retriedCount };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldEmails() {
    this.logger.log('Cleaning up old email records...');

    const retentionDays = parseInt(process.env.EMAIL_RETENTION_DAYS || '90');
    const deletedCount = await this.repository.cleanupOldEmails(retentionDays);

    this.logger.log(`Cleaned up ${deletedCount} old email records`);
  }
}
