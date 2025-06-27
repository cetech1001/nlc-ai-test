'use client'

import { useState } from "react";
import {sampleTransactions, Transaction, transactionColumns} from "@/app/data";
import { Settings2, Search } from "lucide-react";
import {DataTable, TableAction} from "@/app/(dashboard)/components/data-table";
import {Pagination} from "@/app/(dashboard)/components/pagination";

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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h2 className="text-stone-50 text-2xl font-medium leading-relaxed">
            All Transactions
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-[100rem] max-w-md">
              <input
                type="text"
                placeholder="Search users using name, plan, email etc."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <button className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity p-2">
              <Settings2 className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>

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
