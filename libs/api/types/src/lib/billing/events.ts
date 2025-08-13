import { BaseEvent } from '@nlc-ai/api-messaging';

export interface BillingPaymentCompletedEvent extends BaseEvent {
  eventType: 'billing.payment.completed';
  payload: {
    transactionID: string;
    coachID: string;
    planID: string;
    amount: number;
    currency: string;
    externalPaymentID: string;
    status: 'completed';
  };
}

export interface BillingSubscriptionActivatedEvent extends BaseEvent {
  eventType: 'billing.subscription.activated';
  payload: {
    subscriptionID: string;
    coachID: string;
    planID: string;
    billingCycle: 'monthly' | 'annual';
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
}

export interface BillingInvoiceIssuedEvent extends BaseEvent {
  eventType: 'billing.invoice.issued';
  payload: {
    invoiceID: string;
    coachID: string;
    amount: number;
    currency: string;
    dueDate: string;
    invoiceNumber: string;
  };
}

export type BillingEvent =
  | BillingPaymentCompletedEvent
  | BillingSubscriptionActivatedEvent
  | BillingInvoiceIssuedEvent;
