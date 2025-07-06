'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DataTable, PageHeader, Pagination } from "@nlc-ai/shared";
import { CoachesPageSkeleton } from "@/app/(dashboard)/coaches/components/coaches-page.skeleton";
import { coachesAPI } from "@/lib/api/coaches";
import {transformCoachData, coachColumns} from "@/lib/utils/coaches";
import { AlertBanner } from "@nlc-ai/ui";

export default function Coaches() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [coaches, setCoaches] = useState<any[]>([]);
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

  const coachesPerPage = 10;

  useEffect(() => {
    fetchCoaches();
  }, [currentPage, searchQuery]);

  const fetchCoaches = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await coachesAPI.getCoaches(
        currentPage,
        coachesPerPage,
        undefined, // No status filter (get all)
        searchQuery || undefined
      );

      const transformedData = transformCoachData(response.data);
      setCoaches(transformedData);
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

  const handleRowAction = (action: string, coach: any) => {
    console.log("Action called: ", action, coach);
    if (action === 'make-payment') {
      router.push('/coaches/make-payment');
    } else if (action === 'toggle-status') {
      handleToggleStatus(coach.originalId);
    } else if (action === 'delete') {
      handleDeleteCoach(coach.originalId);
    }
  };

  const handleToggleStatus = async (coachId: string) => {
    try {
      await coachesAPI.toggleCoachStatus(coachId);
      setSuccessMessage("Coach status updated successfully!");
      await fetchCoaches(); // Refresh the list

      // Clear success message after 3 seconds
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
      await fetchCoaches(); // Refresh the list

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to deactivate coach");
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  if (isLoading && currentPage === 1 && !searchQuery) {
    return <CoachesPageSkeleton length={coachColumns.length} />
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {successMessage && (
          <AlertBanner type={"success"} message={successMessage} onDismiss={clearMessages}/>
        )}

        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={clearMessages}/>
        )}

        <PageHeader
          title="Coaches List"
          showSearch={true}
          searchPlaceholder="Search users using name, plan, email etc."
          searchValue={searchQuery}
          onSearchChange={handleSearch}
          showFilterButton={true}
          onFilterClick={() => console.log('Filter clicked')}
        />

        {isLoading && (
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-8 text-center">
            <div className="text-stone-400 text-lg">Loading coaches...</div>
          </div>
        )}

        {!isLoading && (
          <>
            <DataTable
              columns={coachColumns}
              data={coaches}
              onRowAction={handleRowAction}
              emptyMessage="No coaches found"
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
      </div>
    </div>
  );
}
