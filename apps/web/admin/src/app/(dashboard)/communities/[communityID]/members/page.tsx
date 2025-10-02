'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Shield, Mail, Plus, Search } from 'lucide-react';
import { BackTo, DataTable, Pagination, StatCard, DataFilter, PageHeader } from "@nlc-ai/web-shared";
import { Button, Skeleton } from '@nlc-ai/web-ui';
import { FilterValues } from "@nlc-ai/sdk-core";
import { toast } from 'sonner';
import {
  sdkClient,
  InviteMemberModal,
  AddMemberModal,
  memberColumns,
  // MembersMobileCard,
  memberFilters,
  emptyMemberFilterValues
} from "@/lib";
import {ExtendedCommunityMember} from "@nlc-ai/sdk-communities";

interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  owners: number;
  admins: number;
  moderators: number;
  regularMembers: number;
  suspendedMembers: number;
  pendingMembers: number;
}

const AdminCommunityMembersPage = () => {
  const router = useRouter();
  const params = useParams();
  const communityID = params.communityID as string;

  const [stats, setStats] = useState<MemberStats | null>(null);
  const [members, setMembers] = useState<ExtendedCommunityMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyMemberFilterValues);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Effects
  useEffect(() => {
    fetchMembersData();
    fetchStats();
  }, [communityID]);

  useEffect(() => {
    fetchMembersData();
  }, [currentPage, searchQuery, filterValues]);

  // Data fetching functions
  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const statsData = await sdkClient.communities.getCommunityMemberStats(communityID);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load member statistics');
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchMembersData = async () => {
    try {
      setIsLoading(true);

      const response = await sdkClient.communities.getCommunityMembers(
        communityID,
        {
          page: currentPage,
          limit: 10,
          search: searchQuery,
        },
        filterValues
      );

      setMembers(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Failed to fetch members data:', error);
      toast.error('Failed to load community members');
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleMemberAction = async (action: string, member: ExtendedCommunityMember) => {
    console.log(`${action} member:`, member?.id);

    switch (action) {
      case 'view-profile':
        toast.info('View profile functionality to be implemented');
        break;
      case 'change-role':
        toast.info('Change role functionality to be implemented');
        break;
      case 'suspend':
        toast.info('Suspend member functionality to be implemented');
        break;
      case 'activate':
        toast.info('Activate member functionality to be implemented');
        break;
      case 'remove':
        if (confirm('Are you sure you want to remove this member?')) {
          try {
            const targetMember: ExtendedCommunityMember | undefined = members.find(m => m.id === member?.id);
            if (targetMember) {
              await sdkClient.communities.removeMember(
                communityID,
                targetMember.userID,
                targetMember.userType
              );
              toast.success('Member removed successfully');
              await fetchMembersData();
              await fetchStats();
            }
          } catch (error: any) {
            toast.error(error.message || 'Failed to remove member');
          }
        }
        break;
      default:
        toast.info(`${action} functionality to be implemented`);
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
    setFilterValues(emptyMemberFilterValues);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const onMemberAdded = () => {
    fetchMembersData();
    fetchStats();
  };

  const onMemberInvited = () => {
    fetchStats();
  };

  // Loading state
  if (isLoading && !members.length) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <Skeleton className="h-8 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isFilterOpen ? 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' : ''}`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        <BackTo
          title="Community Members"
          onClick={() => router.push(`/communities/${communityID}`)}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Members"
            value={stats?.totalMembers}
            subtitle={`${stats?.activeMembers || 0} active`}
            icon={Users}
            iconBgColor="from-blue-600/20 to-cyan-600/20"
            isLoading={isStatsLoading}
          />
          <StatCard
            title="Admins & Mods"
            value={(stats?.admins || 0) + (stats?.moderators || 0)}
            subtitle={`${stats?.owners || 0} owner`}
            icon={Shield}
            iconBgColor="from-purple-600/20 to-violet-600/20"
            isLoading={isStatsLoading}
          />
          <StatCard
            title="Regular Members"
            value={stats?.regularMembers}
            subtitle="Community members"
            icon={Users}
            iconBgColor="from-green-600/20 to-emerald-600/20"
            isLoading={isStatsLoading}
          />
          <StatCard
            title="Pending/Suspended"
            value={(stats?.pendingMembers || 0) + (stats?.suspendedMembers || 0)}
            subtitle="Need attention"
            icon={Users}
            iconBgColor="from-red-600/20 to-pink-600/20"
            isLoading={isStatsLoading}
          />
        </div>

        {/* Page Header with Search and Actions */}
        <PageHeader
          title="Member Management"
          actionButton={{
            label: 'Invite Member',
            onClick: () => setShowInviteModal(true),
            icon: <Mail className="w-4 h-4" />,
          }}
          showActionOnMobile={true}
        >
          <>
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <DataFilter
              filters={memberFilters}
              values={filterValues}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              setIsFilterOpen={setIsFilterOpen}
            />

            <div className="flex gap-2">
              <Button
                onClick={() => setShowInviteModal(true)}
                className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors hidden sm:flex"
              >
                <Mail className="w-4 h-4 mr-2" />
                Invite Member
              </Button>

              <Button
                onClick={() => setShowAddMemberModal(true)}
                variant="outline"
                className="hidden sm:flex"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
          </>
        </PageHeader>

        {/*<MembersMobileCard members={members}/>*/}

        {/* Members Table */}
        <DataTable
          columns={memberColumns}
          data={members}
          onRowAction={handleMemberAction}
          showMobileCards={true}
          // mobileCardComponent={MembersMobileCard}
          emptyMessage="No members found matching your criteria"
          isLoading={isLoading}
          actions={[
            { action: 'view-profile', label: 'View Profile' },
            { action: 'change-role', label: 'Change Role' },
            { action: 'suspend', label: 'Suspend' },
            { action: 'remove', label: 'Remove' },
          ]}
        />

        {/* Pagination */}
        <Pagination
          totalPages={pagination.totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isLoading={isLoading}
        />

        {/* Modals */}
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          communityID={communityID}
          onSuccess={onMemberInvited}
        />

        <AddMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          communityID={communityID}
          onAddSuccess={onMemberAdded}
        />
      </div>
    </div>
  );
};

export default AdminCommunityMembersPage;
