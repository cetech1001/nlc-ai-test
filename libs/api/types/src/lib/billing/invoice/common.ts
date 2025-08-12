export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  planID?: string;
  metadata?: Record<string, any>;
}
