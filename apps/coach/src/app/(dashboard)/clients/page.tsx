'use client'

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Pagination,
  PageHeader,
  DataFilter,
  MobilePagination,
  DataTable,
} from "@nlc-ai/shared";
import { clientsAPI } from "@nlc-ai/api-client";
import { AlertBanner } from '@nlc-ai/ui';
import { ClientWithDetails, FilterValues, DataTableClient } from "@nlc-ai/types";
import {clientColumns, clientFilters, emptyClientFilterValues, transformClientData} from "@/lib";

const Clients = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyClientFilterValues);
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

  const clientsPerPage = 10;

  useEffect(() => {
    (() => fetchClients())();
  }, [currentPage, searchQuery, filterValues]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await clientsAPI.getClients(
        currentPage,
        clientsPerPage,
        filterValues,
        searchQuery
      );

      setClients(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || "Failed to load clients");
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
    setFilterValues(emptyClientFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const handleViewDetails = (clientID: string) => {
    router.push(`/clients/${clientID}`);
  };

  const transformedClients = transformClientData(clients);

  const handleRowAction = async (action: string, client: DataTableClient) => {
    if (action === 'view-details') {
      handleViewDetails(client.originalID);
    }
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

        <PageHeader title="Clients List">
          <>
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                placeholder="Search clients using name, plan, email etc."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <DataFilter
              filters={clientFilters}
              values={filterValues}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              setIsFilterOpen={setIsFilterOpen}
            />
          </>
        </PageHeader>

        <DataTable
          columns={clientColumns}
          data={transformedClients}
          onRowAction={handleRowAction}
          showMobileCards={true}
          emptyMessage="No clients found matching your criteria"
          isLoading={isLoading}
        />

        <Pagination
          totalPages={pagination.totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isLoading={isLoading}
        />

        {!isLoading && clients.length > 0 && (
          <MobilePagination pagination={pagination}/>
        )}
      </div>
    </div>
  );
}

export default Clients;
