import { tableRenderers } from "@nlc-ai/web-shared";
import {DataTableTransaction, TableColumn, TransactionWithDetails} from "@nlc-ai/types";
import { formatCurrency } from "@nlc-ai/web-utils";

export const transformPaymentHistoryData = (transactions: TransactionWithDetails[]): DataTableTransaction[] => {
  return transactions.map((transaction: TransactionWithDetails) => ({
    id: transaction.id,
    invoiceNumber: transaction.invoiceNumber,
    planName: transaction.planName,
    amount: formatCurrency(transaction.amount),
    status: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1),
    paymentMethod: transaction.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    transactionDate: new Date(transaction.transactionDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
  }));
};

const colWidth = 100 / 7;
export const paymentHistoryColumns: TableColumn<DataTableTransaction>[] = [
  {
    key: 'id',
    header: 'Transaction ID',
    width: `${colWidth}%`,
    // render: (value: string) => tableRenderers.truncateText(value, 12)
  },
  {
    key: 'invoiceNumber',
    header: 'Invoice #',
    width: `${colWidth}%`,
    render: (value: string) => tableRenderers.truncateText(value, 12)
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
    // render: (value: number) => formatCurrency(value)
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
