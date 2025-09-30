'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, MessageSquare, Heart, Download, Shield, Calendar } from 'lucide-react';
import { BackTo, StatCard } from "@nlc-ai/web-shared";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nlc-ai/web-ui';
import { sdkClient } from "@/lib";

interface CommunityStats {
  memberGrowth: number;
  postGrowth: number;
  engagementRate: number;
  activeMembers: number;
  totalPosts: number;
  totalComments: number;
  averagePostsPerDay: number;
}

const AdminCommunityAnalyticsPage = () => {
  const router = useRouter();
  const params = useParams();
  const communityID = params.communityID as string;

  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [community, setCommunity] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [communityID, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      // Fetch community details
      const communityData = await sdkClient.communities.getCommunity(communityID);
      setCommunity(communityData);

      // Fetch analytics stats
      const analyticsData = await sdkClient.communities.getCommunityAnalytics(communityID, timeRange);
      setStats(analyticsData);

      // Fetch recent activity
      const activityData = await sdkClient.communities.getCommunityActivity(communityID, 20);
      setActivities(activityData);

    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    if (!stats || !community) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Members', community.memberCount],
      ['Member Growth', `${stats.memberGrowth}%`],
      ['Total Posts', stats.totalPosts],
      ['Post Growth', `${stats.postGrowth}%`],
      ['Total Comments', stats.totalComments],
      ['Engagement Rate', stats.engagementRate],
      ['Active Members', stats.activeMembers],
      ['Avg Posts/Day', stats.averagePostsPerDay],
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `community-analytics-${communityID}-${timeRange}.csv`;
    a.click();
  };

  // Generate activity chart data from recent activities
  const generateActivityChartData = () => {
    if (!activities.length) return [];

    const dataMap = new Map<string, { posts: number; comments: number; members: number }>();

    activities.forEach(activity => {
      const date = new Date(activity.createdAt).toISOString().split('T')[0];
      const existing = dataMap.get(date) || { posts: 0, comments: 0, members: 0 };

      if (activity.type === 'post_created') {
        existing.posts += 1;
      } else if (activity.type === 'comment_added') {
        existing.comments += 1;
      } else if (activity.type === 'member_joined') {
        existing.members += 1;
      }

      dataMap.set(date, existing);
    });

    return Array.from(dataMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Last 7 days
  };

  const activityChartData = generateActivityChartData();

  // Calculate engagement metrics
  const engagementMetrics = stats ? [
    {
      metric: 'Posts per Member',
      value: community?.memberCount > 0 ? (stats.totalPosts / community.memberCount).toFixed(2) : '0',
      change: stats.postGrowth
    },
    {
      metric: 'Comments per Post',
      value: stats.totalPosts > 0 ? (stats.totalComments / stats.totalPosts).toFixed(2) : '0',
      change: stats.engagementRate
    },
    {
      metric: 'Engagement Rate',
      value: `${stats.engagementRate.toFixed(1)}%`,
      change: stats.memberGrowth
    },
    {
      metric: 'Avg Posts per Day',
      value: stats.averagePostsPerDay.toFixed(1),
      change: stats.postGrowth
    }
  ] : [];

  // Get top contributors from activities
  const getTopContributors = () => {
    const contributorMap = new Map<string, {
      userID: string;
      userName: string;
      userAvatarUrl: string;
      posts: number;
      comments: number;
    }>();

    activities.forEach(activity => {
      if (!activity.userID || !activity.userName) return;

      const existing = contributorMap.get(activity.userID) || {
        userID: activity.userID,
        userName: activity.userName,
        userAvatarUrl: activity.userAvatarUrl || '',
        posts: 0,
        comments: 0,
      };

      if (activity.type === 'post_created') {
        existing.posts += 1;
      } else if (activity.type === 'comment_added') {
        existing.comments += 1;
      }

      contributorMap.set(activity.userID, existing);
    });

    return Array.from(contributorMap.values())
      .map(c => ({ ...c, score: c.posts * 3 + c.comments }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const topContributors = getTopContributors();

  if (isLoading || !stats || !community) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-neutral-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-neutral-800 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-neutral-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <BackTo
          title="Community Analytics"
          onClick={() => router.push(`/communities/${communityID}`)}
        />

        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as '7d' | '30d' | '90d')}>
            <SelectTrigger className="w-32 bg-neutral-800 border-neutral-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Members"
          value={community.memberCount || 0}
          growth={stats.memberGrowth}
          icon={Users}
          iconBgColor="from-blue-600/20 to-cyan-600/20"
        />
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          growth={stats.postGrowth}
          icon={MessageSquare}
          iconBgColor="from-green-600/20 to-emerald-600/20"
        />
        <StatCard
          title="Total Comments"
          value={stats.totalComments}
          growth={stats.engagementRate}
          icon={MessageSquare}
          iconBgColor="from-orange-600/20 to-yellow-600/20"
        />
        <StatCard
          title="Active Members"
          value={stats.activeMembers}
          growth={stats.memberGrowth}
          icon={Heart}
          iconBgColor="from-red-600/20 to-pink-600/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-56 h-56 -right-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }}
                    />
                    <Bar dataKey="posts" fill="#8B5CF6" name="Posts" />
                    <Bar dataKey="comments" fill="#06B6D4" name="Comments" />
                    <Bar dataKey="members" fill="#10B981" name="New Members" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-48 h-48 -left-6 -top-10 bg-gradient-to-l from-emerald-200 via-emerald-600 to-blue-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-6">Engagement Metrics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {engagementMetrics.map((metric) => (
                  <div key={metric.metric} className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
                    <div>
                      <div className="text-stone-300 font-medium">{metric.metric}</div>
                      <div className="text-2xl font-bold text-white">{metric.value}</div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                      metric.change > 0
                        ? 'bg-green-600/20 text-green-400'
                        : metric.change < 0
                          ? 'bg-red-600/20 text-red-400'
                          : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Top Contributors */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-4">Top Contributors</h3>

              {topContributors.length > 0 ? (
                <div className="space-y-4">
                  {topContributors.map((member, index) => (
                    <div key={member.userID} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-stone-200 font-medium text-sm">{member.userName}</div>
                          <div className="text-stone-400 text-xs">
                            {member.posts}p • {member.comments}c
                          </div>
                        </div>
                      </div>
                      <div className="text-purple-400 font-bold text-sm">
                        {member.score}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-stone-400 text-sm text-center py-4">
                  No activity yet
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-blue-200 via-blue-600 to-cyan-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push(`/communities/${communityID}/moderate`)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Moderate Community
                </Button>
                <Button
                  onClick={() => router.push(`/communities/${communityID}/members`)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Members
                </Button>
                <Button
                  onClick={() => router.push(`/communities/${communityID}`)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Community
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommunityAnalyticsPage;
