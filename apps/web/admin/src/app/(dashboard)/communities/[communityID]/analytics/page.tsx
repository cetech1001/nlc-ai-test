'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import {TrendingUp, Users, MessageSquare, Heart, Calendar, Download, Shield} from 'lucide-react';
import { BackTo, StatCard } from "@nlc-ai/web-shared";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nlc-ai/web-ui';

interface CommunityAnalytics {
  overview: {
    totalMembers: number;
    memberGrowth: number;
    totalPosts: number;
    postGrowth: number;
    totalComments: number;
    commentGrowth: number;
    totalReactions: number;
    reactionGrowth: number;
    engagementRate: number;
    activeMembers: number;
  };
  memberGrowth: Array<{
    date: string;
    members: number;
    newMembers: number;
  }>;
  postActivity: Array<{
    date: string;
    posts: number;
    comments: number;
    reactions: number;
  }>;
  topMembers: Array<{
    id: string;
    name: string;
    posts: number;
    comments: number;
    reactions: number;
    score: number;
  }>;
  contentTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  engagementMetrics: Array<{
    metric: string;
    value: number;
    change: number;
  }>;
}

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

const AdminCommunityAnalyticsPage = () => {
  const router = useRouter();
  const params = useParams();
  const communityID = params.communityID as string;

  const [analytics, setAnalytics] = useState<CommunityAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeChart, setActiveChart] = useState<'activity' | 'growth'>('activity');

  useEffect(() => {
    fetchAnalytics();
  }, [communityID, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      // Mock analytics data - this would come from your API
      const mockAnalytics: CommunityAnalytics = {
        overview: {
          totalMembers: 89,
          memberGrowth: 12.5,
          totalPosts: 156,
          postGrowth: 8.3,
          totalComments: 423,
          commentGrowth: 15.2,
          totalReactions: 1247,
          reactionGrowth: 22.1,
          engagementRate: 68.5,
          activeMembers: 61,
        },
        memberGrowth: [
          { date: '2024-01-01', members: 45, newMembers: 5 },
          { date: '2024-01-07', members: 52, newMembers: 7 },
          { date: '2024-01-14', members: 61, newMembers: 9 },
          { date: '2024-01-21', members: 73, newMembers: 12 },
          { date: '2024-01-28', members: 89, newMembers: 16 },
        ],
        postActivity: [
          { date: '2024-01-01', posts: 12, comments: 34, reactions: 89 },
          { date: '2024-01-07', posts: 18, comments: 45, reactions: 123 },
          { date: '2024-01-14', posts: 15, comments: 52, reactions: 156 },
          { date: '2024-01-21', posts: 22, comments: 67, reactions: 198 },
          { date: '2024-01-28', posts: 19, comments: 58, reactions: 234 },
        ],
        topMembers: [
          { id: '1', name: 'Sarah Johnson', posts: 25, comments: 67, reactions: 142, score: 234 },
          { id: '2', name: 'Mike Thompson', posts: 18, comments: 45, reactions: 98, score: 161 },
          { id: '3', name: 'Emily Davis', posts: 12, comments: 38, reactions: 76, score: 126 },
          { id: '4', name: 'John Smith', posts: 8, comments: 29, reactions: 54, score: 91 },
          { id: '5', name: 'Lisa Wilson', posts: 6, comments: 22, reactions: 43, score: 71 },
        ],
        contentTypes: [
          { type: 'Text Posts', count: 89, percentage: 57.1 },
          { type: 'Images', count: 34, percentage: 21.8 },
          { type: 'Links', count: 21, percentage: 13.5 },
          { type: 'Videos', count: 8, percentage: 5.1 },
          { type: 'Polls', count: 4, percentage: 2.6 },
        ],
        engagementMetrics: [
          { metric: 'Posts per Member', value: 1.75, change: 8.3 },
          { metric: 'Comments per Post', value: 2.71, change: 12.1 },
          { metric: 'Reactions per Post', value: 7.99, change: 18.5 },
          { metric: 'Daily Active Users', value: 23, change: 15.2 },
        ],
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    // Implement data export functionality
    console.log('Exporting analytics data...');
  };

  if (isLoading || !analytics) {
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
          <Select value={timeRange} onValueChange={setTimeRange}>
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
          value={analytics.overview.totalMembers}
          growth={analytics.overview.memberGrowth}
          icon={Users}
          iconBgColor="from-blue-600/20 to-cyan-600/20"
        />
        <StatCard
          title="Total Posts"
          value={analytics.overview.totalPosts}
          growth={analytics.overview.postGrowth}
          icon={MessageSquare}
          iconBgColor="from-green-600/20 to-emerald-600/20"
        />
        <StatCard
          title="Total Comments"
          value={analytics.overview.totalComments}
          growth={analytics.overview.commentGrowth}
          icon={MessageSquare}
          iconBgColor="from-orange-600/20 to-yellow-600/20"
        />
        <StatCard
          title="Total Reactions"
          value={analytics.overview.totalReactions}
          growth={analytics.overview.reactionGrowth}
          icon={Heart}
          iconBgColor="from-red-600/20 to-pink-600/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant={activeChart === 'activity' ? 'default' : 'outline'}
              onClick={() => setActiveChart('activity')}
            >
              Post Activity
            </Button>
            <Button
              size="sm"
              variant={activeChart === 'growth' ? 'default' : 'outline'}
              onClick={() => setActiveChart('growth')}
            >
              Member Growth
            </Button>
          </div>

          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8">
            <h3 className="text-xl font-bold text-white mb-6">
              {activeChart === 'activity' ? 'Post Activity Over Time' : 'Member Growth Over Time'}
            </h3>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'activity' ? (
                  <BarChart data={analytics.postActivity}>
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
                    <Bar dataKey="reactions" fill="#10B981" name="Reactions" />
                  </BarChart>
                ) : (
                  <LineChart data={analytics.memberGrowth}>
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
                    <Line
                      type="monotone"
                      dataKey="members"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      name="Total Members"
                    />
                    <Line
                      type="monotone"
                      dataKey="newMembers"
                      stroke="#06B6D4"
                      strokeWidth={2}
                      name="New Members"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8">
            <h3 className="text-xl font-bold text-white mb-6">Engagement Metrics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analytics.engagementMetrics.map((metric, index) => (
                <div key={metric.metric} className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
                  <div>
                    <div className="text-stone-300 font-medium">{metric.metric}</div>
                    <div className="text-2xl font-bold text-white">{metric.value}</div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                    metric.change > 0
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Content Types */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Content Types</h3>

            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.contentTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {analytics.contentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {analytics.contentTypes.map((type, index) => (
                <div key={type.type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-stone-300">{type.type}</span>
                  </div>
                  <div className="text-stone-400">
                    {type.count} ({type.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Members */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Top Contributors</h3>

            <div className="space-y-4">
              {analytics.topMembers.map((member, index) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-stone-200 font-medium text-sm">{member.name}</div>
                      <div className="text-stone-400 text-xs">
                        {member.posts}p • {member.comments}c • {member.reactions}r
                      </div>
                    </div>
                  </div>
                  <div className="text-purple-400 font-bold text-sm">
                    {member.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6">
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
                onClick={() => router.push(`/communities/${communityID}/settings`)}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Community Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommunityAnalyticsPage;
