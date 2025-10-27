import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@nlc-ai/api-messaging';
import { UserType } from '@nlc-ai/api-types';
import {NotificationsService} from "../../notifications/notifications.service";
import {NotificationPriority} from "../../notifications/dto";

@Injectable()
export class BillingHandler {
  private readonly logger = new Logger(BillingHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'notifications-service.billing-events',
      [
        'billing.payment.completed',
        'billing.payment.failed',
        'billing.subscription.activated',
        'billing.subscription.cancelled',
        'billing.invoice.issued',
      ],
      this.handleBillingEvents.bind(this)
    );
  }

  private async handleBillingEvents(event: any) {
    try {
      const { eventType, payload } = event;

      switch (eventType) {
        case 'billing.payment.completed':
          await this.handlePaymentCompleted(payload);
          break;
        case 'billing.payment.failed':
          await this.handlePaymentFailed(payload);
          break;
        case 'billing.subscription.activated':
          await this.handleSubscriptionActivated(payload);
          break;
        case 'billing.subscription.cancelled':
          await this.handleSubscriptionCancelled(payload);
          break;
        case 'billing.invoice.issued':
          await this.handleInvoiceIssued(payload);
          break;
      }
    } catch (error) {
      this.logger.error('Failed to handle billing event:', error);
    }
  }

  private async handlePaymentCompleted(payload: any) {
    const amount = (payload.amount / 100).toFixed(2);

    await this.notificationsService.createNotification({
      userID: payload.coachID,
      userType: UserType.coach,
      type: 'payment_success',
      title: 'Payment Received Successfully ✅',
      message: `Your payment of $${amount} has been processed successfully. Thank you!`,
      actionUrl: '/dashboard/billing',
      priority: 'normal',
      metadata: {
        source: 'billing.payment.completed',
        transactionID: payload.transactionID,
        amount: payload.amount,
        planID: payload.planID,
      },
    });

    this.logger.log(`Payment success notification sent to coach ${payload.coachID}`);
  }

  private async handlePaymentFailed(payload: any) {
    const amount = (payload.amount / 100).toFixed(2);

    await this.notificationsService.createNotification({
      userID: payload.coachID,
      userType: UserType.coach,
      type: 'urgent',
      title: 'Payment Failed - Action Required ⚠️',
      message: `Your payment of $${amount} could not be processed. Please update your payment method to avoid service interruption.`,
      actionUrl: '/dashboard/billing/payment-methods',
      priority: NotificationPriority.URGENT,
  });

    this.logger.log(`Payment failure notification sent to coach ${payload.coachID}`);
  }

  private async handleSubscriptionActivated(payload: any) {
    await this.notificationsService.createNotification({
      userID: payload.coachID,
      userType: UserType.coach,
      type: 'subscription_active',
      title: 'Subscription Activated! 🚀',
      message: `Your subscription is now active. Enjoy all the features of your plan!`,
      actionUrl: '/dashboard',
      priority: 'high',
      metadata: {
        source: 'billing.subscription.activated',
        subscriptionID: payload.subscriptionID,
        planID: payload.planID,
        billingCycle: payload.billingCycle,
      },
    });

    this.logger.log(`Subscription activation notification sent to coach ${payload.coachID}`);
  }

  private async handleSubscriptionCancelled(payload: any) {
    await this.notificationsService.createNotification({
      userID: payload.coachID,
      userType: UserType.coach,
      type: 'subscription_cancelled',
      title: 'Subscription Cancelled',
      message: 'Your subscription has been cancelled. You can reactivate anytime from your billing settings.',
      actionUrl: '/dashboard/billing',
      priority: 'normal',
      metadata: {
        source: 'billing.subscription.cancelled',
        subscriptionID: payload.subscriptionID,
        cancelReason: payload.cancelReason,
      },
    });

    this.logger.log(`Subscription cancellation notification sent to coach ${payload.coachID}`);
  }

  private async handleInvoiceIssued(payload: any) {
    const amount = (payload.amount / 100).toFixed(2);
    const dueDate = new Date(payload.dueDate).toLocaleDateString();

    await this.notificationsService.createNotification({
      userID: payload.coachID,
      userType: UserType.coach,
      type: 'invoice_issued',
      title: 'New Invoice Available 📄',
      message: `Invoice ${payload.invoiceNumber} for $${amount} is now available. Due date: ${dueDate}`,
      actionUrl: `/dashboard/billing/invoices/${payload.invoiceNumber}`,
      priority: 'normal',
      metadata: {
        source: 'billing.invoice.issued',
        invoiceID: payload.invoiceID,
        invoiceNumber: payload.invoiceNumber,
        amount: payload.amount,
        dueDate: payload.dueDate,
      },
    });

    this.logger.log(`Invoice notification sent to coach ${payload.coachID}`);
  }
}
