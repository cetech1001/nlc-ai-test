import {Coach, Invoice, Subscription, Transaction} from "@prisma/client";

export interface InvoiceWithDetails extends Invoice{
  coach: Pick<Coach, 'firstName' | 'lastName' | 'businessName' | 'email'>;
  subscription?: Pick<Subscription, 'status' | 'billingCycle'> & {
    plan: {
      name: string;
    }
  } | null;
  transaction?: Pick<Transaction, 'status' | 'stripePaymentID'> | null;
}
