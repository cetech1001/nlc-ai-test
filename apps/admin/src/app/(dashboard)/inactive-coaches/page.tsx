'use client'

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Pagination, PageHeader, DataFilter, MobilePagination } from "@nlc-ai/shared";
import { coachesAPI } from "@nlc-ai/api-client";
import {
  emptyInactiveCoachesFilterValues,
  CoachesPageSkeleton,
  inactiveCoachFilters,
  CoachesTable
} from "@/lib";
import { AlertBanner } from '@nlc-ai/ui';
import {CoachWithStatus, FilterValues} from "@nlc-ai/types";

export default function InactiveCoaches() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [coaches, setCoaches] = useState<CoachWithStatus[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyInactiveCoachesFilterValues);
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

      const filtersWithStatus = {
        ...filterValues,
        status: 'inactive'
      };

      const response = await coachesAPI.getCoaches(
        currentPage,
        coachesPerPage,
        filtersWithStatus,
        searchQuery
      );

      setCoaches(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || "Failed to load inactive coaches");
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
    setFilterValues(emptyInactiveCoachesFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSendEmail = (coachID: string) => {
    router.push(`/inactive-coaches/send-mail?coachID=${coachID}`);
  }

  const handleActionSuccess = async () => {
    setSuccessMessage("Coach activated successfully!");
    await fetchCoaches();
    setTimeout(() => setSuccessMessage(""), 3000);
  }

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

        <PageHeader
          title="Inactive Coaches"
        >
          <>
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                placeholder="Search inactive coaches..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <DataFilter
              filters={inactiveCoachFilters}
              values={filterValues}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              setIsFilterOpen={setIsFilterOpen}
            />
          </>
        </PageHeader>

        {isLoading && (
          <CoachesPageSkeleton length={7}/>
        )}

        {!isLoading && (
          <>
            <CoachesTable
              coaches={coaches}
              handleRouteClick={handleSendEmail}
              handleActionSuccess={handleActionSuccess}
              setError={setError}
              areInactiveCoaches={true}
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

        {!isLoading && coaches.length > 0 && (
          <MobilePagination pagination={pagination}/>
        )}
      </div>
    </div>
  );
}
