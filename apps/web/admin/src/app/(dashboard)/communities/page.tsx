'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, Users, MessageSquare, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { DataTable, Pagination, PageHeader, DataFilter, MobilePagination, StatCard } from "@nlc-ai/web-shared";
import { AlertBanner, Button } from '@nlc-ai/web-ui';
import {communityColumns, sdkClient} from "@/lib";
import { FilterValues } from "@nlc-ai/sdk-core";

interface CommunityStats {
  total: number;
  active: number;
  coachToCommunities: number;
  coachClientCommunities: number;
  totalMembers: number;
  totalPosts: number;
  avgMembersPerCommunity: number;
  avgPostsPerCommunity: number;
}

interface DataTableCommunity {
  id: string;
  name: string;
  type: string;
  memberCount: number;
  postCount: number;
  ownerName: string;
  createdAt: string;
  isActive: boolean;
  originalID: string;
}

const communityFilters = [
  {
    key: 'type',
    label: 'Type',
    type: 'select' as const,
    options: [
      { label: 'All Types', value: '' },
      { label: 'Coach-to-Coach', value: 'coach_to_coach' },
      { label: 'Coach-Client', value: 'coach_client' },
      { label: 'Course', value: 'course' },
      { label: 'Private', value: 'private' },
    ],
  },
  {
    key: 'visibility',
    label: 'Visibility',
    type: 'select' as const,
    options: [
      { label: 'All', value: '' },
      { label: 'Public', value: 'public' },
      { label: 'Private', value: 'private' },
      { label: 'Invite Only', value: 'invite_only' },
    ],
  },
  {
    key: 'isActive',
    label: 'Status',
    type: 'select' as const,
    options: [
      { label: 'All', value: '' },
      { label: 'Active', value: 'true' },
      { label: 'Inactive', value: 'false' },
    ],
  },
  {
    key: 'dateRange',
    label: 'Created Date',
    type: 'date-range' as const,
  },
];

const emptyFilterValues: FilterValues = {
  type: '',
  visibility: '',
  isActive: '',
  dateRange: null,
};

const AdminCommunitiesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isCommunitiesLoading, setIsCommunitiesLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [communities, setCommunities] = useState<DataTableCommunity[]>([]);
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
  const [stats, setStats] = useState<CommunityStats | null>(null);

  const communitiesPerPage = 10;

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'created') {
      setSuccessMessage('Community created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    if (success) {
      router.replace(window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      try {
        setError("");
        await Promise.all([
          fetchCommunities(),
          fetchStats(),
        ]);
      } catch (e: any) {
        const message = e.message || "Failed to load communities";
        setError(message);
        toast.error(message);
      }
    })();
  }, []);

  useEffect(() => {
    (() => fetchCommunities())();
  }, [currentPage, searchQuery, filterValues]);

  const fetchCommunities = async () => {
    try {
      setIsCommunitiesLoading(true);

      const response = await sdkClient.communities.getCommunities({
        page: currentPage,
        limit: communitiesPerPage,
        search: searchQuery,
        type: filterValues.type || undefined,
        visibility: filterValues.visibility || undefined,
      });

      // Transform response data to match DataTable format
      const transformedData = response.data.map((community: any) => ({
        id: community.id,
        name: community.name,
        type: community.type,
        memberCount: community.memberCount,
        postCount: community.postCount,
        ownerName: community.ownerType === 'coach' ? 'Coach' : community.ownerType,
        createdAt: new Date(community.createdAt).toLocaleDateString(),
        isActive: community.isActive,
        originalID: community.id,
      }));

      setCommunities(transformedData);
      setPagination(response.pagination);
    } catch (e) {
      throw e;
    } finally {
      setIsCommunitiesLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const statsData = await sdkClient.communities.getCommunityStats();
      setStats(statsData);
    } catch (e: any) {
      console.error('Failed to fetch stats:', e);
      toast.error('Failed to load statistics');
    } finally {
      setIsStatsLoading(false);
    }
  };

  const handleRowAction = async (action: string, community: any) => {
    if (action === 'view-details') {
      router.push(`/communities/${community.originalID}`);
    } else if (action === 'moderate') {
      router.push(`/communities/${community.originalID}/moderate`);
    } else if (action === 'analytics') {
      router.push(`/communities/${community.originalID}/analytics`);
    } else if (action === 'members') {
      router.push(`/communities/${community.originalID}/members`);
    } else if (action === 'settings') {
      router.push(`/communities/${community.originalID}/settings`);
    } else if (action === 'toggle-status') {
      toast.info('Toggle status functionality to be implemented');
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

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className={`flex flex-col ${isFilterOpen && 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]'}`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {successMessage && (
          <AlertBanner type={"success"} message={successMessage} onDismiss={clearMessages}/>
        )}

        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={clearMessages}/>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Communities"
            value={stats?.total}
            icon={Users}
            subtitle="&nbsp;"
            iconBgColor="from-violet-600/20 to-fuchsia-600/20"
            isLoading={isStatsLoading}
          />
          <StatCard
            title="Active Communities"
            value={stats?.active}
            subtitle={`${stats?.total ? Math.round((stats.active / stats.total) * 100) : 0}% active`}
            icon={TrendingUp}
            iconBgColor="from-green-600/20 to-emerald-600/20"
            isLoading={isStatsLoading}
          />
          <StatCard
            title="Total Members"
            value={stats?.totalMembers}
            subtitle={`Avg ${stats?.avgMembersPerCommunity || 0} per community`}
            icon={Users}
            iconBgColor="from-blue-600/20 to-cyan-600/20"
            isLoading={isStatsLoading}
          />
          <StatCard
            title="Total Posts"
            value={stats?.totalPosts}
            subtitle={`Avg ${stats?.avgPostsPerCommunity || 0} per community`}
            icon={MessageSquare}
            iconBgColor="from-orange-600/20 to-yellow-600/20"
            isLoading={isStatsLoading}
          />
        </div>

        <PageHeader
          title="Community Management"
          actionButton={{
            label: 'Create Community',
            onClick: () => router.push('/communities/create'),
            icon: <Plus className="w-4 h-4" />,
          }}
          showActionOnMobile={true}
        >
          <>
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <DataFilter
              filters={communityFilters}
              values={filterValues}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              setIsFilterOpen={setIsFilterOpen}
            />

            <Button
              onClick={() => router.push('/communities/create')}
              className={'bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors hidden sm:flex'}
            >
              <span className="w-4 h-4 mr-2">
                <Plus className="w-4 h-4" />
              </span>
              Create Community
            </Button>
          </>
        </PageHeader>

        <DataTable
          columns={communityColumns}
          data={communities}
          onRowAction={handleRowAction}
          showMobileCards={true}
          emptyMessage="No communities found matching your criteria"
          isLoading={isCommunitiesLoading}
          actions={[
            { action: 'view-details', label: 'View Details' },
            { action: 'moderate', label: 'Moderate' },
            { action: 'toggle-status', label: 'Toggle Status' },
          ]}
        />

        <Pagination
          totalPages={pagination.totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isLoading={isCommunitiesLoading}
        />

        {!isCommunitiesLoading && communities.length > 0 && (
          <MobilePagination pagination={pagination}/>
        )}
      </div>
    </div>
  );
}

export default AdminCommunitiesPage;
