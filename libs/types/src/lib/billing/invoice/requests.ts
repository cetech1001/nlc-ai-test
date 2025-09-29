import {InvoiceLineItem} from "./common";
import {UserType} from "../../users";

export interface CreateInvoiceRequest {
  customerID: string;
  customerType: UserType;
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
  status?: string;
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

export interface InvoiceFilters {
  customerID?: string;
  customerType?: UserType;
  subscriptionID?: string;
  transactionID?: string;
  status?: string;
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
