import { tableRenderers } from "@nlc-ai/shared";
import {TableColumn, FilterConfig} from "@nlc-ai/types";

export interface PaymentHistoryData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  planType: string;
  amount: number;
  paidOn: string;
  status: string;
}

export interface PaymentHistoryFilterValues {
  status: string;
  planType: string;
  dateRange: string;
}

export const emptyPaymentHistoryFilterValues: PaymentHistoryFilterValues = {
  status: '',
  planType: '',
  dateRange: ''
};

export const transformPaymentHistoryData = (payments: any[]): PaymentHistoryData[] => {
  return payments.map((payment: any) => ({
    id: payment.id,
    invoiceNumber: `#${payment.id}`,
    invoiceDate: payment.invoiceDate,
    planType: payment.planType,
    amount: payment.amount,
    paidOn: payment.paidOn,
    status: payment.status
  }));
};

const colWidth = 100 / 7;
export const paymentHistoryColumns: TableColumn<PaymentHistoryData>[] = [
  {
    key: 'invoiceNumber',
    header: 'Invoice No.',
    width: `${colWidth}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'invoiceDate',
    header: 'Invoice Date',
    width: `${colWidth}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'planType',
    header: 'Plan Type',
    width: `${colWidth}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'amount',
    header: 'Amount',
    width: `${colWidth}%`,
    render: (value: number) => tableRenderers.currencyText(value)
  },
  {
    key: 'paidOn',
    header: 'Paid On',
    width: `${colWidth}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'status',
    header: 'Status',
    width: `${colWidth}%`,
    render: (value: string) => tableRenderers.status(value)
  },
  {
    key: 'actions',
    header: 'Actions',
    width: 'auto',
    render: (_: string, row: PaymentHistoryData, onAction?: (action: string, row: PaymentHistoryData) => void) => {
      return tableRenderers.actions('Download', row, 'download', onAction);
    }
  }
];

export const paymentHistoryFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'All Statuses', value: '' },
      { label: 'Paid', value: 'paid' },
      { label: 'Cancelled', value: 'cancelled' },
      { label: 'Pending', value: 'pending' },
      { label: 'Failed', value: 'failed' }
    ]
  },
  {
    key: 'planType',
    label: 'Plan Type',
    type: 'select',
    options: [
      { label: 'All Plans', value: '' },
      { label: 'Starter', value: 'starter' },
      { label: 'Growth', value: 'growth' },
      { label: 'Premium', value: 'premium' },
      { label: 'Enterprise', value: 'enterprise' }
    ]
  },
  {
    key: 'dateRange',
    label: 'Date Range',
    type: 'select',
    options: [
      { label: 'All Time', value: '' },
      { label: 'Last 30 Days', value: '30d' },
      { label: 'Last 3 Months', value: '3m' },
      { label: 'Last 6 Months', value: '6m' },
      { label: 'Last Year', value: '1y' }
    ]
  }
];
