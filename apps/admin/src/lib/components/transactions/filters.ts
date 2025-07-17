import {FilterConfig, FilterValues} from "@nlc-ai/types";

export const transactionFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Transaction Status',
    type: 'select',
    placeholder: 'All Statuses',
    options: [
      { label: 'Completed', value: 'completed' },
      { label: 'Pending', value: 'pending' },
      { label: 'Failed', value: 'failed' },
      { label: 'Processing', value: 'processing' },
      { label: 'Canceled', value: 'canceled' },
      { label: 'Refunded', value: 'refunded' },
    ],
    defaultValue: '',
  },
  {
    key: 'paymentMethod',
    label: 'Payment Method',
    type: 'multi-select',
    options: [
      { label: 'Credit Card', value: 'credit_card' },
      { label: 'Debit Card', value: 'debit_card' },
      { label: 'PayPal', value: 'paypal' },
      { label: 'Bank Transfer', value: 'bank_transfer' },
      { label: 'Stripe', value: 'stripe' },
      { label: 'Manual', value: 'manual' },
    ],
    defaultValue: [],
  },
  {
    key: 'dateRange',
    label: 'Transaction Date',
    type: 'date-range',
    defaultValue: { start: null, end: null },
  },
  {
    key: 'amountRange',
    label: 'Amount Range',
    type: 'amount-range',
    defaultValue: { min: '', max: '' },
  },
  {
    key: 'planNames',
    label: 'Subscription Plans',
    type: 'multi-select',
    options: [
      { label: 'Solo Agent', value: 'Solo Agent' },
      { label: 'Starter Pack', value: 'Starter Pack' },
      { label: 'Growth Pro', value: 'Growth Pro' },
      { label: 'Scale Elite', value: 'Scale Elite' },
    ],
    defaultValue: [],
  },
];

export const emptyTransactionsFilterValues: FilterValues = {
  status: '',
  paymentMethod: [],
  dateRange: { start: null, end: null },
  amountRange: { min: '', max: '' },
  planNames: [],
};
