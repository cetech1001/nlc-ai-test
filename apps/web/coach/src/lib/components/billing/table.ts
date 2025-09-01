import { tableRenderers } from "@nlc-ai/web-shared";
import {DataTableTransaction, ExtendedTransaction} from "@nlc-ai/sdk-billing";
import { formatCurrency } from "@nlc-ai/web-utils";
import {TableColumn} from "@nlc-ai/types";

export const transformPaymentHistoryData = (transactions: ExtendedTransaction[]): DataTableTransaction[] => {
  return transactions.map((transaction: ExtendedTransaction) => ({
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
