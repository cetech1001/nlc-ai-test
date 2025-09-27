import { Processor, Process } from '@nestjs/bull';
import { type Job } from 'bull';
import { Logger } from '@nestjs/common';
import { OutboxService } from '@nlc-ai/api-messaging';
import { EmailEvent } from '@nlc-ai/api-types';
import { SchedulingRepository } from '../repositories/scheduling.repository';
import { DeliveryService } from '../../delivery/delivery.service';

@Processor('email-scheduling')
export class SchedulingProcessor {
  private readonly logger = new Logger(SchedulingProcessor.name);
  private readonly maxRetries = 3;

  constructor(
    private readonly repository: SchedulingRepository,
    private readonly deliveryService: DeliveryService,
    private readonly outbox: OutboxService,
  ) {}

  @Process('process-scheduled-email')
  async processScheduledEmail(job: Job<{ emailID: string }>) {
    const { emailID } = job.data;

    try {
      this.logger.log(`Processing scheduled email: ${emailID}`);

      // Get email details
      const email = await this.repository.getEmailByID(emailID);
      if (!email) {
        throw new Error(`Email ${emailID} not found`);
      }

      // Validate email can be sent
      const validation = await this.validateEmailDelivery(email);
      if (!validation.canSend) {
        await this.repository.updateEmail(emailID, {
          status: 'cancelled',
          errorMessage: validation.reason,
        });
        return;
      }

      // Mark as processing
      await this.repository.updateEmail(emailID, { status: 'processing' });

      // Queue for delivery based on type
      if (email.emailThreadID) {
        // Thread reply
        await this.deliveryService.sendThreadReply(emailID);
      } else {
        // Coach/sequence email
        await this.deliveryService.sendCoachEmail(emailID);
      }

      this.logger.log(`Successfully queued email for delivery: ${emailID}`);

    } catch (error: any) {
      this.logger.error(`Failed to process scheduled email ${emailID}:`, error);
      await this.handleSchedulingError(emailID, error);
      throw error;
    }
  }

  private async validateEmailDelivery(email: any): Promise<{ canSend: boolean; reason?: string }> {
    // Check if coach is active
    if (email.coachID && !email.coach?.isActive) {
      return { canSend: false, reason: 'Coach account is inactive' };
    }

    // Check if client is active
    if (email.clientID && !email.client?.isActive) {
      return { canSend: false, reason: 'Client account is inactive' };
    }

    // Check if email sequence is still active
    if (email.emailSequenceID && !email.emailSequence?.isActive) {
      return { canSend: false, reason: 'Email sequence is no longer active' };
    }

    // Check for lead status
    if (email.leadID && email.lead?.status === 'unsubscribed') {
      return { canSend: false, reason: 'Lead has unsubscribed' };
    }

    // Check for recent duplicates
    const isDuplicate = await this.repository.checkRecentDuplicate(email);
    if (isDuplicate) {
      return { canSend: false, reason: 'Similar email sent recently' };
    }

    return { canSend: true };
  }

  private async handleSchedulingError(emailID: string, error: any): Promise<void> {
    const email = await this.repository.getEmailByID(emailID);
    if (!email) return;

    const retryCount = (email.retryCount || 0) + 1;

    if (retryCount < this.maxRetries) {
      // Schedule retry
      const retryAt = new Date(Date.now() + retryCount * 30 * 60 * 1000); // 30min, 60min, 90min

      await this.repository.updateEmail(emailID, {
        status: 'scheduled',
        scheduledFor: retryAt,
        retryCount,
        errorMessage: error.message,
      });

      this.logger.warn(`Scheduling retry ${retryCount}/${this.maxRetries} for email ${emailID} at ${retryAt}`);
    } else {
      // Mark as permanently failed
      await this.repository.updateEmail(emailID, {
        status: 'failed',
        errorMessage: error.message,
      });

      // Emit failure event
      await this.outbox.saveAndPublishEvent<EmailEvent>(
        {
          eventType: 'email.scheduled.failed',
          schemaVersion: 1,
          payload: {
            scheduledEmailID: emailID,
            coachID: email.coachID!,
            recipientEmail: email.to,
            error: error.message,
            retryCount,
            failedAt: new Date().toISOString(),
          },
        },
        'email.scheduled.failed'
      );

      this.logger.error(`Email permanently failed: ${emailID}`);
    }
  }
}
