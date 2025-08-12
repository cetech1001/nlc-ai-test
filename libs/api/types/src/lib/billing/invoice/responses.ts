import {InvoiceStatus} from "@prisma/client";

export interface InvoiceWithDetails {
  id: string;
  coachID: string;
  subscriptionID?: string;
  transactionID?: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date;
  lineItems: any;
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  total: number;
  notes?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  coach: {
    firstName: string;
    lastName: string;
    email: string;
    businessName?: string;
  };
  subscription?: {
    status: string;
    billingCycle: string;
    plan: {
      name: string;
    };
  };
  transaction?: {
    status: string;
    stripePaymentID?: string;
  };
}
