'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Crown, Shield, UserPlus, Search } from 'lucide-react';
import { BackTo, DataTable, Pagination, StatCard } from "@nlc-ai/web-shared";
import { Button, Skeleton } from '@nlc-ai/web-ui';
import { formatDate } from "@nlc-ai/web-utils";

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

interface CommunityMember {
  id: string;
  userID: string;
  userName: string;
  userType: 'coach' | 'client' | 'admin';
  role: 'owner' | 'admin' | 'moderator' | 'member';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  joinedAt: string;
  lastActiveAt?: string;
  permissions: string[];
  postCount: number;
  commentCount: number;
}

const AdminCommunityMembersPage = () => {
  const router = useRouter();
  const params = useParams();
  const communityID = params.communityID as string;

  const [stats, setStats] = useState<MemberStats | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    fetchMembersData();
  }, [communityID, currentPage, searchQuery, roleFilter, statusFilter]);

  const fetchMembersData = async () => {
    try {
      setIsLoading(true);

      // Mock data - this would come from your API
      const mockStats: MemberStats = {
        totalMembers: 89,
        activeMembers: 82,
        owners: 1,
        admins: 2,
        moderators: 5,
        regularMembers: 74,
        suspendedMembers: 3,
        pendingMembers: 4,
      };

      const mockMembers: CommunityMember[] = [
        {
          id: '1',
          userID: 'user1',
          userName: 'Sarah Johnson',
          userType: 'coach',
          role: 'owner',
          status: 'active',
          joinedAt: new Date('2024-01-01').toISOString(),
          lastActiveAt: new Date('2024-01-20').toISOString(),
          permissions: ['all'],
          postCount: 25,
          commentCount: 67,
        },
        {
          id: '2',
          userID: 'user2',
          userName: 'Mike Thompson',
          userType: 'coach',
          role: 'admin',
          status: 'active',
          joinedAt: new Date('2024-01-05').toISOString(),
          lastActiveAt: new Date('2024-01-19').toISOString(),
          permissions: ['manage_community', 'moderate_posts', 'manage_members'],
          postCount: 18,
          commentCount: 45,
        },
        {
          id: '3',
          userID: 'user3',
          userName: 'Emily Davis',
          userType: 'client',
          role: 'member',
          status: 'active',
          joinedAt: new Date('2024-01-10').toISOString(),
          lastActiveAt: new Date('2024-01-18').toISOString(),
          permissions: ['create_posts', 'comment', 'react'],
          postCount: 8,
          commentCount: 23,
        },
        {
          id: '4',
          userID: 'user4',
          userName: 'John Smith',
          userType: 'client',
          role: 'member',
          status: 'suspended',
          joinedAt: new Date('2024-01-15').toISOString(),
          lastActiveAt: new Date('2024-01-16').toISOString(),
          permissions: [],
          postCount: 3,
          commentCount: 8,
        },
      ];

      setStats(mockStats);
      setMembers(mockMembers);
      setPagination({
        page: currentPage,
        limit: 10,
        total: mockMembers.length,
        totalPages: Math.ceil(mockMembers.length / 10),
        hasNext: false,
        hasPrev: false,
      });
    } catch (error) {
      console.error('Failed to fetch members data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberAction = async (memberID: string, action: string) => {
    console.log(`${action} member:`, memberID);
    // Implement member actions
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'moderator':
        return <Users className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'admin':
        return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'moderator':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'member':
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'inactive':
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      case 'suspended':
        return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const memberColumns = [
    {
      key: 'userName',
      header: 'Member',
      render: (value: string, row: CommunityMember) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="text-stone-200 font-medium">{value}</div>
            <div className="text-stone-400 text-sm">{row.userType}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getRoleIcon(value)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(value)}`}>
            {value}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'postCount',
      header: 'Posts',
    },
    {
      key: 'commentCount',
      header: 'Comments',
    },
    {
      key: 'joinedAt',
      header: 'Joined',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'lastActiveAt',
      header: 'Last Active',
      render: (value?: string) => value ? formatDate(value) : 'Never',
    },
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading) {
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
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <BackTo
        title="Community Members"
        onClick={() => router.push(`/communities/${communityID}`)}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Members"
          value={stats?.totalMembers}
          subtitle={`${stats?.activeMembers} active`}
          icon={Users}
          iconBgColor="from-blue-600/20 to-cyan-600/20"
          isLoading={!stats}
        />
        <StatCard
          title="Admins & Mods"
          value={(stats?.admins || 0) + (stats?.moderators || 0)}
          subtitle={`${stats?.owners} owner`}
          icon={Shield}
          iconBgColor="from-purple-600/20 to-violet-600/20"
          isLoading={!stats}
        />
        <StatCard
          title="Regular Members"
          value={stats?.regularMembers}
          subtitle="Community members"
          icon={Users}
          iconBgColor="from-green-600/20 to-emerald-600/20"
          isLoading={!stats}
        />
        <StatCard
          title="Pending/Suspended"
          value={(stats?.pendingMembers || 0) + (stats?.suspendedMembers || 0)}
          subtitle="Need attention"
          icon={Users}
          iconBgColor="from-red-600/20 to-pink-600/20"
          isLoading={!stats}
        />
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg px-4 py-2 pl-10 text-white placeholder:text-stone-400"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-neutral-800/50 border border-neutral-600 rounded-lg px-4 py-2 text-white"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="member">Member</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-800/50 border border-neutral-600 rounded-lg px-4 py-2 text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>

        <Button
          onClick={() => console.log('Invite member')}
          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Members Table */}
      <DataTable
        columns={memberColumns}
        data={filteredMembers}
        showMobileCards={true}
        emptyMessage="No members found matching your criteria"
        isLoading={false}
        actions={[
          { action: 'view-profile', label: 'View Profile' },
          { action: 'change-role', label: 'Change Role' },
          { action: 'suspend', label: 'Suspend' },
          { action: 'remove', label: 'Remove' },
        ]}
        onRowAction={(action, row) => {
          handleMemberAction(row.id, action);
        }}
      />

      <Pagination
        totalPages={pagination.totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoading={false}
      />
    </div>
  );
};

export default AdminCommunityMembersPage;
