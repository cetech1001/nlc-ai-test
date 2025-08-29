
'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Flag, Users, CheckCircle, AlertTriangle, Shield, Search } from 'lucide-react';
import { BackTo, DataTable, Pagination, StatCard, DataFilter, PageHeader } from "@nlc-ai/web-shared";
import { Button } from '@nlc-ai/web-ui';
import { FilterValues } from '@nlc-ai/sdk-core';
import { toast } from 'sonner';
import {moderationActionColumns, moderationContentColumns, sdkClient} from "@/lib";
import { ModerationStats, FlaggedContent, ModerationAction } from '@nlc-ai/sdk-community';
import { moderationFilters, emptyModerationFilterValues } from '@/lib/components/communities/filters';

const AdminCommunityModeratePage = () => {
  const router = useRouter();
  const params = useParams();
  const communityID = params.communityID as string;

  // State
  const [activeTab, setActiveTab] = useState<'content' | 'actions' | 'settings'>('content');
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [_, setIsProcessing] = useState<string | null>(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyModerationFilterValues);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination state
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
    fetchModerationData();
  }, [communityID]);

  useEffect(() => {
    if (activeTab === 'content') {
      fetchFlaggedContent();
    } else if (activeTab === 'actions') {
      fetchModerationActions();
    }
  }, [communityID, activeTab, searchQuery, filterValues, currentPage]);

  const fetchModerationData = async () => {
    try {
      setIsStatsLoading(true);
      const statsResponse = await sdkClient.community.moderation.getModerationStats(communityID);
      setStats(statsResponse);
    } catch (error: any) {
      console.error('Failed to fetch moderation data:', error);
      toast.error('Failed to load moderation statistics');
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchFlaggedContent = async () => {
    try {
      setIsLoading(true);

      const response = await sdkClient.community.moderation.getFlaggedContent(
        communityID,
        { page: currentPage, limit: 10, search: searchQuery },
        filterValues
      );

      setFlaggedContent(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Failed to fetch flagged content:', error);
      toast.error('Failed to load flagged content');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModerationActions = async () => {
    try {
      setIsLoading(true);

      const response = await sdkClient.community.moderation.getModerationActions(
        communityID,
        { page: currentPage, limit: 10 }
      );

      setModerationActions(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Failed to fetch moderation actions:', error);
      toast.error('Failed to load moderation actions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentAction = async (contentID: string, action: 'approve' | 'remove' | 'dismiss') => {
    try {
      setIsProcessing(contentID);

      await sdkClient.community.moderation.moderateContent(communityID, contentID, {
        action,
        reason: `Content ${action}d by moderator`
      });

      toast.success(`Content ${action}d successfully`);

      // Refresh the content list and stats
      await fetchFlaggedContent();
      await fetchModerationData();

    } catch (error: any) {
      console.error(`Failed to ${action} content:`, error);
      toast.error(`Failed to ${action} content`);
    } finally {
      setIsProcessing(null);
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
    setFilterValues(emptyModerationFilterValues);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleTabChange = (tab: 'content' | 'actions' | 'settings') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
    setFilterValues(emptyModerationFilterValues);
  };

  return (
    <div className={`flex flex-col ${isFilterOpen ? 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' : ''}`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        <BackTo
          title="Community Moderation"
          onClick={() => router.push(`/communities/${communityID}`)}
        />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-600/30">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Content Moderation</h1>
              <p className="text-stone-400">Review flagged content and manage community safety</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Pending Reports"
              value={stats?.pendingReports}
              subtitle="Needs review"
              icon={Flag}
              iconBgColor="from-red-600/20 to-pink-600/20"
              isLoading={isStatsLoading}
              growth={stats?.pendingReportsTrend}
            />
            <StatCard
              title="Total Flags"
              value={stats?.totalFlags}
              subtitle="All time"
              icon={AlertTriangle}
              iconBgColor="from-orange-600/20 to-yellow-600/20"
              isLoading={isStatsLoading}
              growth={stats?.totalFlagsTrend}
            />
            <StatCard
              title="Actions Taken"
              value={stats?.actionsTaken}
              subtitle="Last 30 days"
              icon={Shield}
              iconBgColor="from-blue-600/20 to-purple-600/20"
              isLoading={isStatsLoading}
              growth={stats?.actionsTakenTrend}
            />
            <StatCard
              title="Auto-Resolved"
              value={stats?.autoResolved}
              subtitle="By AI moderation"
              icon={CheckCircle}
              iconBgColor="from-green-600/20 to-emerald-600/20"
              isLoading={isStatsLoading}
              growth={stats?.autoResolvedTrend}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-700 mb-6">
          {[
            { key: 'content', label: 'Flagged Content', icon: Flag },
            { key: 'actions', label: 'Moderation Log', icon: Shield },
            { key: 'settings', label: 'Auto-Moderation', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-400 bg-purple-600/5'
                    : 'border-transparent text-stone-400 hover:text-stone-300 hover:bg-neutral-800/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <>
            {/* Search and Filters */}
            <PageHeader title="" showActionOnMobile={false}>
              <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search content, authors, or violations..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
                />
                <Search className="w-5 h-5 text-white" />
              </div>

              <DataFilter
                filters={moderationFilters}
                values={filterValues}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
                setIsFilterOpen={setIsFilterOpen}
              />
            </PageHeader>

            <DataTable
              columns={moderationContentColumns}
              data={flaggedContent}
              showMobileCards={true}
              emptyMessage="No flagged content found"
              isLoading={isLoading}
              actions={[
                { action: 'view', label: 'View Details' },
                { action: 'approve', label: 'Approve' },
                { action: 'remove', label: 'Remove' },
                { action: 'dismiss', label: 'Dismiss' },
              ]}
              onRowAction={(action, row) => {
                if (action === 'view') {
                  router.push(`/communities/${communityID}/posts/${row.contentID}`);
                } else if (['approve', 'remove', 'dismiss'].includes(action)) {
                  handleContentAction(row.id, action as any);
                }
              }}
            />

            <Pagination
              totalPages={pagination.totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isLoading={isLoading}
            />
          </>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <>
            <DataTable
              columns={moderationActionColumns}
              data={moderationActions}
              showMobileCards={true}
              emptyMessage="No moderation actions found"
              isLoading={isLoading}
            />

            <Pagination
              totalPages={pagination.totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isLoading={isLoading}
            />
          </>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl">
            <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 rounded-2xl border border-neutral-700/50 p-6 lg:p-8">
              <div className="relative">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute w-64 h-64 -right-16 -top-24 bg-gradient-to-l from-blue-400 via-purple-500 to-fuchsia-600 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-white mb-6">Auto-Moderation Settings</h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="p-4 bg-neutral-800/30 border border-neutral-700/50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-medium">AI Content Analysis</h3>
                          <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-medium">
                            Active
                          </div>
                        </div>
                        <p className="text-stone-400 text-sm mb-4">
                          Automatically detect spam, harassment, and inappropriate content
                        </p>
                        <div className="text-xs text-stone-500">
                          Sensitivity: High • Auto-action: Flag for review
                        </div>
                      </div>

                      <div className="p-4 bg-neutral-800/30 border border-neutral-700/50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-medium">Spam Detection</h3>
                          <div className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-medium">
                            Active
                          </div>
                        </div>
                        <p className="text-stone-400 text-sm mb-4">
                          Identify and handle repetitive or promotional content
                        </p>
                        <div className="text-xs text-stone-500">
                          Auto-action: Remove • Appeal: Available
                        </div>
                      </div>
                    </div>

                    <div className="border border-neutral-600/50 rounded-xl p-4 bg-blue-600/5">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-400 text-lg">🤖</div>
                        <div>
                          <div className="text-blue-400 font-medium text-sm mb-1">AI Moderation Status</div>
                          <p className="text-blue-300 text-xs leading-relaxed">
                            AI moderation is processing content in real-time. {stats?.autoResolved || 0} items
                            automatically resolved today with 94% accuracy rate.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push(`/communities/${communityID}/settings`)}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Configure Advanced Settings
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCommunityModeratePage;
