'use client'

import { useState } from "react";
import {sampleTransactions, Transaction, transactionColumns} from "@/app/data";
import {DataTable, TableAction, Pagination, PageHeader} from "@nlc-ai/shared";

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredTransactions, setFilteredTransactions] = useState(sampleTransactions);

  const transactionsPerPage = 10;
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredTransactions(sampleTransactions);
    } else {
      const filtered = sampleTransactions.filter(
        (transaction) =>
          transaction.name.toLowerCase().includes(query.toLowerCase()) ||
          transaction.email.toLowerCase().includes(query.toLowerCase()) ||
          transaction.subscriptionPlan.toLowerCase().includes(query.toLowerCase()) ||
          transaction.id.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredTransactions(filtered);
    }
    setCurrentPage(1);
  };

  const handleRowAction = (action: string, transaction: Transaction) => {
    console.log("Action: ", action);
    console.log("Transaction: ", transaction);
  };

  const actions: TableAction[] = [
    {
      label: 'Download',
      action: 'download',
      variant: 'primary',
    }
  ]

  return (
    <div className="flex flex-col">
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        <PageHeader
          title="All Transactions"
          showSearch={true}
          searchPlaceholder="Search users using name, plan, email etc."
          searchValue={searchQuery}
          onSearchChange={handleSearch}
          showFilterButton={true}
          onFilterClick={() => console.log('Filter clicked')}
        />

        <DataTable
          columns={transactionColumns}
          data={currentTransactions}
          onRowAction={handleRowAction}
          actions={actions}
        />

        <Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
      </div>
    </div>
  );
}
