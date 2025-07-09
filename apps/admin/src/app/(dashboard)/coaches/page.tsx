'use client'

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { DataTable, Pagination, PageHeader, DataFilter, FilterConfig, FilterValues } from "@nlc-ai/shared";
import { CoachesPageSkeleton } from "@/lib/skeletons/coaches-page.skeleton";
import { coachesAPI } from "@nlc-ai/api-client";
import {coachColumns, DataTableCoach, transformCoachData} from "@/lib/utils/coaches";
import { AlertBanner } from '@nlc-ai/ui';

const coachFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Coach Status',
    type: 'select',
    placeholder: 'All Statuses',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Blocked', value: 'blocked' },
    ],
    defaultValue: '',
  },
  {
    key: 'subscriptionPlan',
    label: 'Subscription Plan',
    type: 'multi-select',
    options: [
      { label: 'Solo Agent', value: 'Solo Agent' },
      { label: 'Starter Pack', value: 'Starter Pack' },
      { label: 'Growth Pro', value: 'Growth Pro' },
      { label: 'Scale Elite', value: 'Scale Elite' },
      { label: 'No Plan', value: 'No Plan' },
    ],
    defaultValue: [],
  },
  {
    key: 'dateJoined',
    label: 'Date Joined',
    type: 'date-range',
    defaultValue: { start: null, end: null },
  },
  {
    key: 'lastActive',
    label: 'Last Active',
    type: 'date-range',
    defaultValue: { start: null, end: null },
  },
  {
    key: 'isVerified',
    label: 'Email Verified',
    type: 'select',
    placeholder: 'All',
    options: [
      { label: 'Verified', value: 'true' },
      { label: 'Not Verified', value: 'false' },
    ],
    defaultValue: '',
  },
];

const emptyFilterValues: FilterValues = {
  status: '',
  subscriptionPlan: [],
  dateJoined: { start: null, end: null },
  lastActive: { start: null, end: null },
  isVerified: '',
};

export default function Coaches() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [coaches, setCoaches] = useState<DataTableCoach[]>([]);
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

  const coachesPerPage = 10;

  useEffect(() => {
    fetchCoaches();
  }, [currentPage, searchQuery, filterValues]);

  const fetchCoaches = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await coachesAPI.getCoachesWithFilters(
        currentPage,
        coachesPerPage,
        filterValues,
        searchQuery
      );

      setCoaches(transformCoachData(response.data));
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
    setFilterValues(emptyFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleRowAction = (action: string, coach: any) => {
    if (action === 'make-payment') {
      router.push('/coaches/make-payment');
    } else if (action === 'toggle-status') {
      handleToggleStatus(coach.id);
    } else if (action === 'delete') {
      handleDeleteCoach(coach.id);
    }
  };

  const handleToggleStatus = async (coachId: string) => {
    try {
      await coachesAPI.toggleCoachStatus(coachId);
      setSuccessMessage("Coach status updated successfully!");
      await fetchCoaches();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to update coach status");
    }
  };

  const handleDeleteCoach = async (coachId: string) => {
    if (!confirm("Are you sure you want to deactivate this coach? This action will set their status to blocked.")) {
      return;
    }

    try {
      await coachesAPI.deleteCoach(coachId);
      setSuccessMessage("Coach deactivated successfully!");
      await fetchCoaches();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to deactivate coach");
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

        <PageHeader
          title="Coaches List"
          subtitle="Manage and monitor all coaches in your platform"
        >
          <div className="flex items-center gap-3 w-3/4">
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
          </div>
        </PageHeader>

        {isLoading && (
          <CoachesPageSkeleton length={coachColumns.length}/>
        )}

        {!isLoading && (
          <>
            <DataTable
              columns={coachColumns}
              data={coaches}
              onRowAction={handleRowAction}
              emptyMessage="No coaches found matching your criteria"
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
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-lg border border-neutral-700 p-4 sm:hidden">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-300">
                Showing {coaches.length} of {pagination.total} coaches
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
