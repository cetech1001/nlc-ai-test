'use client'

import { useState, useEffect } from 'react';
import { Search } from "lucide-react";
import {
  transactionColumns,
  transformTransactionData,
  transactionFilters,
  convertTransactionFiltersToAPIFormat,
  TransactionAnalytics,
  TransactionsPageSkeleton
} from "@/lib";
import { DataTable, Pagination, PageHeader, DataFilter } from "@nlc-ai/shared";
import { transactionsAPI } from "@nlc-ai/api-client";
import { AlertBanner } from '@nlc-ai/ui';
import {DataTableTransaction, FilterValues} from "@nlc-ai/types";


const emptyFilterValues: FilterValues = {
  status: '',
  paymentMethod: [],
  dateRange: { start: null, end: null },
  amountRange: { min: '', max: '' },
  planNames: [],
};

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataTableTransaction[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyFilterValues);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const transactionsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchQuery, filterValues]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError("");

      const apiFilters = convertTransactionFiltersToAPIFormat(filterValues);

      const response = await transactionsAPI.getTransactions(
        currentPage,
        transactionsPerPage,
        apiFilters,
        searchQuery
      );

      setTransactions(transformTransactionData(response.data));
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterValues(emptyFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleRowAction = async (action: string, transaction: DataTableTransaction) => {
    if (action === 'download') {
      try {
        await transactionsAPI.downloadTransaction(transaction.id);
        setSuccessMessage("Transaction data downloaded successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error: any) {
        setError(error.message || "Failed to download transaction");
      }
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className={`flex flex-col ${ isFilterOpen && 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' }`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {successMessage && (
          <AlertBanner type={"success"} message={successMessage} onDismiss={clearMessages}/>
        )}

        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={clearMessages}/>
        )}

        {/* Analytics Section */}
        <TransactionAnalytics />

        <PageHeader
          title="All Transactions"
        >
          <>
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                placeholder="Search by transaction ID, coach, plan..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <DataFilter
              filters={transactionFilters}
              values={filterValues}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              setIsFilterOpen={setIsFilterOpen}
            />
          </>
        </PageHeader>

        {isLoading && (
          <TransactionsPageSkeleton length={transactionColumns.length}/>
        )}

        {!isLoading && (
          <>
            <DataTable
              columns={transactionColumns}
              data={transactions}
              onRowAction={handleRowAction}
              emptyMessage="No transactions found matching your criteria"
            />

            {pagination.totalPages > 1 && (
              <Pagination
                totalPages={pagination.totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            )}
          </>
        )}

        {!isLoading && transactions.length > 0 && (
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-lg border border-neutral-700 p-4 sm:hidden">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-300">
                Showing {transactions.length} of {pagination.total} transactions
              </span>
              <div className="flex gap-4 text-stone-400">
                <span>Page {pagination.page} of {pagination.totalPages}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
