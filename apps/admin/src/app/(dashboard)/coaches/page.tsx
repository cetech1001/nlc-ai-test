'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Settings2, Search } from "lucide-react";
import { DataTable, TableColumn, tableRenderers } from "@/app/(dashboard)/components/data-table";
import { Pagination } from "@/app/(dashboard)/components/pagination";
import { CoachesPageSkeleton } from "@/app/(dashboard)/coaches/components/coaches-page.skeleton";
import { coachesAPI, type Coach } from "@/lib/api/coaches";

// Transform API coach data to match table format
const transformCoachData = (coaches: Coach[]) => {
  return coaches.map(coach => ({
    id: `#${coach.id.slice(-4)}`, // Use last 4 chars of ID
    name: `${coach.firstName} ${coach.lastName}`,
    email: coach.email,
    dateJoined: new Date(coach.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    plan: coach.currentPlan || 'No Plan',
    status: coach.status.charAt(0).toUpperCase() + coach.status.slice(1),
    rawStatus: coach.status,
    originalId: coach.id,
  }));
};

// Table columns for coaches
const coachColumns: TableColumn<any>[] = [
  {
    key: 'id',
    header: 'User ID',
    width: '12%',
    render: tableRenderers.basicText
  },
  {
    key: 'name',
    header: 'Name',
    width: '18%',
    render: (value: string) => tableRenderers.truncateText(value, 18)
  },
  {
    key: 'email',
    header: 'Email',
    width: '25%',
    render: (value: string) => tableRenderers.truncateText(value, 25)
  },
  {
    key: 'dateJoined',
    header: 'Date Joined',
    width: '15%',
    render: tableRenderers.dateText
  },
  {
    key: 'plan',
    header: 'Plan',
    width: '12%',
    render: tableRenderers.basicText
  },
  {
    key: 'status',
    header: 'Status',
    width: '12%',
    render: (value: string, row: any) => {
      const statusColors: Record<string, string> = {
        'Active': 'text-green-600',
        'Inactive': 'text-yellow-600',
        'Blocked': 'text-red-600',
      };
      return tableRenderers.status(value);
    }
  },
  {
    key: 'actions',
    header: 'Actions',
    width: 'auto',
    render: tableRenderers.simpleActions
  }
];

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
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRowAction = (action: string, coach: any) => {
    if (action === 'payment') {
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
    return <CoachesPageSkeleton />
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-800/20 border border-green-600 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-green-400 text-sm">{successMessage}</p>
              <button
                onClick={clearMessages}
                className="text-green-400 hover:text-green-300 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-800/20 border border-red-600 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={clearMessages}
                className="text-red-400 hover:text-red-300 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-stone-50 text-2xl font-medium leading-relaxed mb-2">
              Coaches List
            </h2>
            <p className="text-stone-300 text-sm">
              Manage and monitor all coaches in your platform
            </p>
          </div>
          <div className="flex items-center gap-3">
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

            <button className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity p-2">
              <Settings2 className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>

        {/* Loading state for search/pagination */}
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

        {/* Stats Summary */}
        {!isLoading && coaches.length > 0 && (
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-lg border border-neutral-700 p-4">
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
