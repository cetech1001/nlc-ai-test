import {Invoice, Subscription, Transaction} from "@prisma/client";

export interface ExtendedInvoice extends Invoice {
  customer: {
    id: string;
    type: string;
    name: string;
    email: string;
  };
  subscription?: Pick<Subscription, 'status' | 'billingCycle'> & {
    plan?: { name: string; };
    community?: { name: string; };
    course?: { title: string; };
  } | null;
  transaction?: Pick<Transaction, 'status' | 'stripePaymentID'> | null;
}
