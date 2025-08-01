import { tableRenderers } from "@nlc-ai/shared";
import {DataTableTransaction, TableColumn, TransactionWithDetails} from "@nlc-ai/types";
import { formatCurrency } from "@nlc-ai/utils";

export const transformTransactionData = (transactions: TransactionWithDetails[]): DataTableTransaction[] => {
  return transactions.map((transaction: TransactionWithDetails) => ({
    id: transaction.id,
    coachName: transaction.coachName,
    coachEmail: transaction.coachEmail,
    planName: transaction.planName,
    amount: formatCurrency(transaction.amount),
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
    // render: (value: number) => tableRenderers.currencyText(value)
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
