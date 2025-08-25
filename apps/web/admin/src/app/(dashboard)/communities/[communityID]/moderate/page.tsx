'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Flag, MessageSquare, Users, Search } from 'lucide-react';
import { BackTo, DataTable, StatCard } from "@nlc-ai/web-shared";
import { Button, Badge, Skeleton } from '@nlc-ai/web-ui';
import { formatDate } from "@nlc-ai/web-utils";

interface ModerationStats {
  totalPosts: number;
  flaggedPosts: number;
  totalComments: number;
  flaggedComments: number;
  activeMembers: number;
  suspendedMembers: number;
}

interface FlaggedContent {
  id: string;
  type: 'post' | 'comment';
  content: string;
  authorName: string;
  authorType: string;
  flagCount: number;
  reasons: string[];
  createdAt: Date;
  status: 'pending' | 'resolved' | 'dismissed';
}

interface MemberAction {
  id: string;
  memberName: string;
  memberType: string;
  action: string;
  reason: string;
  performedBy: string;
  createdAt: Date;
}

const AdminCommunityModeratePage = () => {
  const router = useRouter();
  const params = useParams();
  const communityID = params.communityID as string;

  const [activeTab, setActiveTab] = useState<'content' | 'members' | 'actions'>('content');
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [memberActions, setMemberActions] = useState<MemberAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');

  useEffect(() => {
    fetchModerationData();
  }, [communityID]);

  const fetchModerationData = async () => {
    try {
      setIsLoading(true);

      // Mock data - this would come from your API
      const mockStats: ModerationStats = {
        totalPosts: 143,
        flaggedPosts: 7,
        totalComments: 456,
        flaggedComments: 12,
        activeMembers: 89,
        suspendedMembers: 3,
      };

      const mockFlaggedContent: FlaggedContent[] = [
        {
          id: '1',
          type: 'post',
          content: 'This is a potentially inappropriate post that has been flagged by multiple users...',
          authorName: 'John Doe',
          authorType: 'client',
          flagCount: 3,
          reasons: ['Inappropriate content', 'Spam'],
          createdAt: new Date('2024-01-20'),
          status: 'pending',
        },
        {
          id: '2',
          type: 'comment',
          content: 'This comment contains potentially offensive language...',
          authorName: 'Jane Smith',
          authorType: 'coach',
          flagCount: 2,
          reasons: ['Harassment'],
          createdAt: new Date('2024-01-19'),
          status: 'pending',
        },
      ];

      const mockMemberActions: MemberAction[] = [
        {
          id: '1',
          memberName: 'John Doe',
          memberType: 'client',
          action: 'suspended',
          reason: 'Multiple violations',
          performedBy: 'Admin',
          createdAt: new Date('2024-01-18'),
        },
      ];

      setStats(mockStats);
      setFlaggedContent(mockFlaggedContent);
      setMemberActions(mockMemberActions);
    } catch (error) {
      console.error('Failed to fetch moderation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentAction = async (contentID: string, action: 'approve' | 'remove' | 'dismiss') => {
    console.log(`${action} content:`, contentID);
    // Implement content moderation actions
  };

  /*const handleMemberAction = async (memberID: string, action: 'warn' | 'suspend' | 'ban') => {
    console.log(`${action} member:`, memberID);
    // Implement member moderation actions
  };*/

  const contentColumns = [
    {
      key: 'type',
      header: 'Type',
      render: (value: string) => (
        <Badge variant={value === 'post' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'content',
      header: 'Content',
      render: (value: string) => (
        <div className="max-w-md truncate">{value}</div>
      ),
    },
    {
      key: 'authorName',
      header: 'Author',
    },
    {
      key: 'flagCount',
      header: 'Flags',
      render: (value: number) => (
        <Badge variant={value > 2 ? 'destructive' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'reasons',
      header: 'Reasons',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((reason, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {reason}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => {
        const colors = {
          pending: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
          resolved: 'bg-green-600/20 text-green-400 border-green-600/30',
          dismissed: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[value as keyof typeof colors]}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Flagged',
      render: (value: Date) => formatDate(value),
    },
  ];

  const actionColumns = [
    {
      key: 'memberName',
      header: 'Member',
    },
    {
      key: 'memberType',
      header: 'Type',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (value: string) => {
        const colors = {
          warned: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
          suspended: 'bg-orange-600/20 text-orange-400 border-orange-600/30',
          banned: 'bg-red-600/20 text-red-400 border-red-600/30',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[value as keyof typeof colors]}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'reason',
      header: 'Reason',
    },
    {
      key: 'performedBy',
      header: 'By',
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (value: Date) => formatDate(value),
    },
  ];

  const filteredContent = flaggedContent.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <Skeleton className="h-8 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        title="Community Moderation"
        onClick={() => router.push(`/communities/${communityID}`)}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Flagged Posts"
          value={stats?.flaggedPosts}
          subtitle={`${stats?.totalPosts} total posts`}
          icon={Flag}
          iconBgColor="from-red-600/20 to-pink-600/20"
          isLoading={!stats}
        />
        <StatCard
          title="Flagged Comments"
          value={stats?.flaggedComments}
          subtitle={`${stats?.totalComments} total comments`}
          icon={MessageSquare}
          iconBgColor="from-orange-600/20 to-yellow-600/20"
          isLoading={!stats}
        />
        <StatCard
          title="Suspended Members"
          value={stats?.suspendedMembers}
          subtitle={`${stats?.activeMembers} active members`}
          icon={Users}
          iconBgColor="from-purple-600/20 to-violet-600/20"
          isLoading={!stats}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-700 mb-6">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'content'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-stone-400 hover:text-stone-300'
          }`}
        >
          Flagged Content
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-stone-400 hover:text-stone-300'
          }`}
        >
          Member Management
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'actions'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-stone-400 hover:text-stone-300'
          }`}
        >
          Moderation Log
        </button>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search flagged content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg px-4 py-2 pl-10 text-white placeholder:text-stone-400"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-neutral-800/50 border border-neutral-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <DataTable
            columns={contentColumns}
            data={filteredContent}
            showMobileCards={true}
            emptyMessage="No flagged content found"
            isLoading={false}
            actions={[
              { action: 'view', label: 'View Details' },
              { action: 'approve', label: 'Approve' },
              { action: 'remove', label: 'Remove' },
              { action: 'dismiss', label: 'Dismiss' },
            ]}
            onRowAction={(action, row) => {
              if (action === 'approve' || action === 'remove' || action === 'dismiss') {
                handleContentAction(row.id, action as any);
              }
            }}
          />
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-stone-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-300 mb-2">Member Management</h3>
          <p className="text-stone-400 mb-4">Manage community members, roles, and permissions</p>
          <Button
            onClick={() => router.push(`/communities/${communityID}/members`)}
            variant="outline"
          >
            View All Members
          </Button>
        </div>
      )}

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <div className="space-y-6">
          <DataTable
            columns={actionColumns}
            data={memberActions}
            showMobileCards={true}
            emptyMessage="No moderation actions found"
            isLoading={false}
          />
        </div>
      )}
    </div>
  );
};

export default AdminCommunityModeratePage;
