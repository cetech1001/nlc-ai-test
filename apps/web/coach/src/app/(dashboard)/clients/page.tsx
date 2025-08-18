'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import {
  Pagination,
  PageHeader,
  DataFilter,
  MobilePagination,
  DataTable,
} from "@nlc-ai/web-shared";
import { AlertBanner, Button } from '@nlc-ai/web-ui';
import { FilterValues } from "@nlc-ai/types";
import {ClientWithDetails} from "@nlc-ai/types";
import {clientColumns, clientFilters, emptyClientFilterValues, sdkClient} from "@/lib";

const Clients = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    const success = searchParams.get('success');
    if (success) {
      setSuccessMessage(success);
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    (() => fetchClients())();
  }, [currentPage, searchQuery, filterValues]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError("");

      const queryParams = {
        page: currentPage,
        limit: clientsPerPage,
        search: searchQuery || undefined,
        status: filterValues.status || undefined,
        coursesBought: filterValues.coursesBought || undefined,
        dateJoinedStart: filterValues.dateJoined?.start || undefined,
        dateJoinedEnd: filterValues.dateJoined?.end || undefined,
        lastInteractionStart: filterValues.lastInteraction?.start || undefined,
        lastInteractionEnd: filterValues.lastInteraction?.end || undefined,
      };

      const response = await sdkClient.users.getClients(queryParams);
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

  const handleRowAction = async (action: string, client: ClientWithDetails) => {
    if (action === 'view-details') {
      router.push(`/clients/${client.id}`);
    } else if (action === 'view-emails') {
      router.push(`/emails?clientID=${client.id}`);
    } else if (action === 'edit') {
      router.push(`/clients/edit?clientID=${client.id}`);
    }
  };

  return (
    <div className={`flex flex-col ${isFilterOpen && 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]'}`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {successMessage && (
          <AlertBanner type="success" message={successMessage} onDismiss={clearMessages}/>
        )}

        {error && (
          <AlertBanner type="error" message={error} onDismiss={clearMessages}/>
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

            <Button
              onClick={() => router.push('/clients/create')}
              className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors hidden sm:flex"
            >
              <span className="w-4 h-4 mr-2">
                <Plus className="w-4 h-4" />
              </span>
              Add New Client
            </Button>
          </>
        </PageHeader>

        <DataTable
          columns={clientColumns}
          data={clients}
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
