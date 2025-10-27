import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { UserType } from '@nlc-ai/api-types';
import {NotificationsService} from "../../notifications/notifications.service";
import {NotificationPriority} from "../../notifications/dto";

@Injectable()
export class EmailHandler {
  private readonly logger = new Logger(EmailHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'notifications-service.email-events',
      [
        'email.sequence.completed',
        'email.emergency.paused',
        'email.bulk.operation.completed',
        'email.system.health',
      ],
      this.handleEmailEvents.bind(this)
    );
  }

  private async handleEmailEvents(event: any) {
    try {
      const { eventType, payload } = event;

      switch (eventType) {
        case 'email.sequence.completed':
          await this.handleSequenceCompleted(payload);
          break;
        case 'email.emergency.paused':
          await this.handleEmergencyPaused(payload);
          break;
        case 'email.bulk.operation.completed':
          await this.handleBulkOperationCompleted(payload);
          break;
        case 'email.system.health':
          await this.handleSystemHealth(payload);
          break;
      }
    } catch (error) {
      this.logger.error('Failed to handle email event:', error);
    }
  }

  private async handleSequenceCompleted(payload: any) {
    await this.notificationsService.createNotification({
      userID: payload.coachID,
      userType: UserType.coach,
      type: 'email_sequence',
      title: 'Email Sequence Completed 📧',
      message: `Your email sequence has been completed. ${payload.totalEmailsSent} emails were sent successfully.`,
      actionUrl: '/dashboard/email/sequences',
      priority: 'normal',
      metadata: {
        source: 'email.sequence.completed',
        sequenceID: payload.sequenceID,
        leadID: payload.leadID,
        totalEmailsSent: payload.totalEmailsSent,
        conversionStatus: payload.conversionStatus,
      },
    });

    this.logger.log(`Email sequence completion notification sent to coach ${payload.coachID}`);
  }

  private async handleEmergencyPaused(payload: any) {
    await this.notificationsService.createNotification({
      userID: payload.coachID,
      userType: UserType.coach,
      type: 'urgent',
      title: 'Email System Emergency Pause ⚠️',
      message: `Your email system has been paused due to: ${payload.reason}. ${payload.pausedCount} emails were paused.`,
      actionUrl: '/dashboard/email/settings',
      priority: NotificationPriority.URGENT,
  });

    this.logger.log(`Emergency pause notification sent to coach ${payload.coachID}`);
  }

  private async handleBulkOperationCompleted(payload: any) {
    if (payload.coachID) {
      await this.notificationsService.createNotification({
        userID: payload.coachID,
        userType: UserType.coach,
        type: 'email_bulk_operation',
        title: 'Bulk Email Operation Completed',
        message: `Your bulk ${payload.operationType} operation completed. ${payload.successCount} successful, ${payload.failureCount} failed.`,
        actionUrl: '/dashboard/email',
        priority: 'normal',
        metadata: {
          source: 'email.bulk.operation.completed',
          operationID: payload.operationID,
          operationType: payload.operationType,
          successCount: payload.successCount,
          failureCount: payload.failureCount,
        },
      });

      this.logger.log(`Bulk operation completion notification sent to coach ${payload.coachID}`);
    }
  }

  private async handleSystemHealth(payload: any) {
    // Only send notifications for unhealthy status to admins
    if (!payload.isHealthy && payload.issues?.length > 0) {
      // This would need to get admin user IDs from your database
      // For now, just log the health issue
      this.logger.warn('Email system health issue detected:', {
        issues: payload.issues,
        pendingEmails: payload.pendingEmails,
        failureRate: payload.failureRate,
      });

      // You could implement admin notification logic here
      // await this.notifyAdmins('Email System Health Alert', payload.issues.join(', '));
    }
  }

  // Helper method to notify all admins (if needed)
  /*private async notifyAdmins(title: string, message: string) {
    // Implementation would query admin users and send notifications
    // This is left as a placeholder for your specific admin notification needs
    this.logger.log(`Admin notification: ${title} - ${message}`);
  }*/
}
