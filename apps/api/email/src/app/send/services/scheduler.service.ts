import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { type Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectQueue('scheduled-emails') private scheduledEmailsQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.scheduledEmailsQueue.clean(0, 'completed');
    await this.scheduledEmailsQueue.clean(0, 'failed');

    this.logger.log('Scheduler service initialized');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledEmails() {
    try {
      await this.scheduledEmailsQueue.add(
        'process-scheduled-emails',
        {},
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      this.logger.debug('Scheduled email processing job queued');
    } catch (error) {
      this.logger.error('Failed to queue scheduled email processing:', error);
    }
  }

  async triggerScheduledEmailProcessing(): Promise<void> {
    this.logger.log('Manually triggering scheduled email processing');
    await this.processScheduledEmails();
  }

  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.scheduledEmailsQueue.getWaitingCount(),
      this.scheduledEmailsQueue.getActiveCount(),
      this.scheduledEmailsQueue.getCompletedCount(),
      this.scheduledEmailsQueue.getFailedCount(),
      this.scheduledEmailsQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }
}
