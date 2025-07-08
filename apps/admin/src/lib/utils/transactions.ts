import { FilterConfig, TableColumn, tableRenderers } from "@nlc-ai/shared";
import { Transaction, DataTableTransaction } from "@nlc-ai/types";

export const transformTransactionData = (transactions: Transaction[]): DataTableTransaction[] => {
  return transactions.map(transaction => ({
    id: transaction.id,
    coachName: transaction.coachName,
    coachEmail: transaction.coachEmail,
    planName: transaction.planName,
    amount: transaction.amount,
    status: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1),
    paymentMethod: transaction.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    transactionDate: new Date(transaction.transactionDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    invoiceNumber: transaction.invoiceNumber,
  }));
};

const colWidth = 100 / 8;
export const transactionColumns: TableColumn<DataTableTransaction>[] = [
  {
    key: 'id',
    header: 'Transaction ID',
    width: `${colWidth * 0.8}%`,
    render: (value: string) => tableRenderers.truncateText(value, 12)
  },
  {
    key: 'coachName',
    header: 'Coach Name',
    width: `${colWidth}%`,
    render: (value: string) => tableRenderers.truncateText(value, 18)
  },
  {
    key: 'coachEmail',
    header: 'Email',
    width: `${colWidth * 1.2}%`,
    render: (value: string) => tableRenderers.truncateText(value, 22)
  },
  {
    key: 'planName',
    header: 'Plan',
    width: `${colWidth * 0.8}%`,
    render: tableRenderers.basicText
  },
  {
    key: 'amount',
    header: 'Amount',
    width: `${colWidth * 0.7}%`,
    render: (value: number) => tableRenderers.currencyText(value / 100) // Convert from cents
  },
  {
    key: 'status',
    header: 'Status',
    width: `${colWidth * 0.8}%`,
    render: (value: string) => tableRenderers.status(value)
  },
  {
    key: 'transactionDate',
    header: 'Date',
    width: `${colWidth * 0.8}%`,
    render: tableRenderers.dateText
  },
  {
    key: 'actions',
    header: 'Actions',
    width: 'auto',
    render: (_: string, row: DataTableTransaction, onAction?: (action: string, row: DataTableTransaction) => void) => {
      return tableRenderers.actions('Download', row, 'download', onAction);
    }
  }
];

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

// Helper function to convert filter values to API format
export const convertTransactionFiltersToAPIFormat = (filterValues: Record<string, any>) => {
  const apiFilters: Record<string, any> = {};

  // Handle status
  if (filterValues.status && filterValues.status !== '') {
    apiFilters.status = filterValues.status;
  }

  // Handle payment methods (array to comma-separated string)
  if (filterValues.paymentMethod && Array.isArray(filterValues.paymentMethod) && filterValues.paymentMethod.length > 0) {
    apiFilters.paymentMethod = filterValues.paymentMethod;
  }

  // Handle date ranges
  if (filterValues.dateRange) {
    apiFilters.dateRange = filterValues.dateRange;
  }

  // Handle amount range
  if (filterValues.amountRange) {
    apiFilters.amountRange = filterValues.amountRange;
  }

  // Handle plan names
  if (filterValues.planNames && Array.isArray(filterValues.planNames) && filterValues.planNames.length > 0) {
    apiFilters.planNames = filterValues.planNames;
  }

  return apiFilters;
};
