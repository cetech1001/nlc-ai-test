import { InvoiceStatus } from '@prisma/client';

export interface CreateInvoiceRequest {
  coachID: string;
  subscriptionID?: string;
  transactionID?: string;
  amount: number;
  currency?: string;
  dueDate: Date;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  total: number;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateInvoiceRequest {
  status?: InvoiceStatus;
  paidAt?: Date;
  lineItems?: InvoiceLineItem[];
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  total?: number;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  planID?: string;
  metadata?: Record<string, any>;
}

export interface InvoiceFilters {
  coachID?: string;
  subscriptionID?: string;
  transactionID?: string;
  status?: InvoiceStatus;
  amountRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  dueDateRange?: {
    start?: Date;
    end?: Date;
  };
  currency?: string;
  overdue?: boolean;
}

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
