'use client'

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Pagination,
  PageHeader,
  DataFilter,
  MobilePagination,
} from "@nlc-ai/web-shared";
import { coachesAPI } from "@nlc-ai/web-api-client";
import { AlertBanner } from '@nlc-ai/web-ui';
import {
  CoachesTable,
  coachFilters,
  emptyCoachFilterValues, sdkClient,
} from "@/lib";
import {CoachWithStatus, FilterValues} from "@nlc-ai/types";

const Coaches = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [coaches, setCoaches] = useState<CoachWithStatus[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyCoachFilterValues);
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

  const coachesPerPage = 10;

  useEffect(() => {
    (() => fetchCoaches())();
  }, [currentPage, searchQuery, filterValues]);

  const fetchCoaches = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await sdkClient.users.getCoaches({
        ...filterValues,
        page: currentPage,
        limit: coachesPerPage,
        search: searchQuery
      });

      setCoaches(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || "Failed to load coaches");
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
    setFilterValues(emptyCoachFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const handleMakePayment = (coachID: string) => {
    router.push(`/coaches/make-payment?coachID=${coachID}`);
  }

  const handleActionSuccess = async (message: string) => {
    setSuccessMessage("Coach restored successfully!");
    await fetchCoaches();
    setTimeout(() => setSuccessMessage(""), 3000);
  }

  return (
    <div className={`flex flex-col ${ isFilterOpen && 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' }`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {successMessage && (
          <AlertBanner type={"success"} message={successMessage} onDismiss={clearMessages}/>
        )}

        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={clearMessages}/>
        )}

        <PageHeader title="Coaches List">
          <>
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                placeholder="Search coaches by name, email, plan..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <DataFilter
              filters={coachFilters}
              values={filterValues}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              setIsFilterOpen={setIsFilterOpen}
            />
          </>
        </PageHeader>

        <CoachesTable
          coaches={coaches}
          handleActionSuccess={handleActionSuccess}
          handleRouteClick={handleMakePayment}
          setError={setError}
          isLoading={isLoading}
        />

        <Pagination
          totalPages={pagination.totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isLoading={isLoading}
        />

        {!isLoading && coaches.length > 0 && (
          <MobilePagination pagination={pagination}/>
        )}
      </div>
    </div>
  );
}

export default Coaches;
