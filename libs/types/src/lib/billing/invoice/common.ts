export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  planID?: string | null;
  metadata?: Record<string, any>;
}
