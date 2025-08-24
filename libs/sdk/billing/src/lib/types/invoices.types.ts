import {Coach} from "@nlc-ai/sdk-users";
import {Transaction} from "./transactions.types";
import {Subscription} from "./subscriptions.types";

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELED = 'canceled',
  REFUNDED = 'refunded'
}

export interface Invoice {
  id: string;
  coachID: string;
  subscriptionID?: string | null;
  transactionID?: string | null;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date | null;
  lineItems: any;
  subtotal: number;
  taxRate?: number | null;
  taxAmount?: number | null;
  discountAmount?: number | null;
  total: number;
  notes?: string | null;
  metadata?: any | null;
  createdAt: Date;
  updatedAt: Date;
  coach?: Coach;
  subscription?: Subscription | null;
  transaction?: Transaction | null;
}
