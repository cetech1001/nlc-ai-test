'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Pagination,
  PageHeader,
  DataFilter,
  MobilePagination,
} from "@nlc-ai/web-shared";
import { AlertBanner, Button } from '@nlc-ai/web-ui';
import {
  CoachesTable,
  coachFilters,
  emptyCoachFilterValues,
  sdkClient,
} from "@/lib";
import { FilterValues } from "@nlc-ai/sdk-core";
import { ExtendedCoach } from "@nlc-ai/sdk-users";

const AdminCoachesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [coaches, setCoaches] = useState<ExtendedCoach[]>([]);
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
    const success = searchParams.get('success');
    if (success === 'created') {
      setSuccessMessage('Coach created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else if (success === 'updated') {
      setSuccessMessage('Coach updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    if (success) {
      router.replace(window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    (() => fetchCoaches())();
  }, [currentPage, searchQuery, filterValues]);

  const fetchCoaches = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await sdkClient.users.coaches.getCoaches({
        page: currentPage,
        limit: coachesPerPage,
        search: searchQuery
      }, filterValues);

      setCoaches(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      const message = error.message || "Failed to load coaches";
      setError(message);
      toast.error(message);
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

  const handleViewDetails = (coachID: string) => {
    router.push(`/coaches/${coachID}`);
  }

  const handleActionSuccess = async (message: string) => {
    setSuccessMessage(message);
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

        <PageHeader
          title="Coaches List"
          actionButton={{
            label: 'Add New Coach',
            onClick: () => router.push('/coaches/create'),
            icon: <Plus className="w-4 h-4" />,
          }}
          showActionOnMobile={true}
        >
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

            <Button
              onClick={() => router.push('/coaches/create')}
              className={'bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors hidden sm:flex'}
            >
              <span className="w-4 h-4 mr-2">
                <Plus className="w-4 h-4" />
              </span>
              Add New Coach
            </Button>
          </>
        </PageHeader>

        <CoachesTable
          coaches={coaches}
          handleActionSuccess={handleActionSuccess}
          handleRouteClick={handleViewDetails}
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

export default AdminCoachesPage;
