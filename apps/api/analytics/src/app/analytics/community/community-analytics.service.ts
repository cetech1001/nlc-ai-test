import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { AnalyticsQueryDto } from '../dto';

@Injectable()
export class CommunityAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getCommunityAnalytics(communityID: string, query: AnalyticsQueryDto) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

    const [
      community,
      currentPeriodStats,
      previousPeriodStats,
      memberGrowthData,
      activityData,
      contentTypeBreakdown
    ] = await Promise.all([
      this.getCommunityInfo(communityID),
      this.getCommunityStats(communityID, thirtyDaysAgo, now),
      this.getCommunityStats(communityID, sixtyDaysAgo, thirtyDaysAgo),
      this.getMemberGrowthData(communityID),
      this.getActivityData(communityID),
      this.getContentTypeBreakdown(communityID)
    ]);

    const memberGrowth = this.calculateGrowthPercentage(
      currentPeriodStats.memberCount,
      previousPeriodStats.memberCount
    );

    const postGrowth = this.calculateGrowthPercentage(
      currentPeriodStats.postCount,
      previousPeriodStats.postCount
    );

    const commentGrowth = this.calculateGrowthPercentage(
      currentPeriodStats.commentCount,
      previousPeriodStats.commentCount
    );

    const reactionGrowth = this.calculateGrowthPercentage(
      currentPeriodStats.reactionCount,
      previousPeriodStats.reactionCount
    );

    return {
      overview: {
        totalMembers: community?.memberCount,
        memberGrowth,
        totalPosts: currentPeriodStats.postCount,
        postGrowth,
        totalComments: currentPeriodStats.commentCount,
        commentGrowth,
        totalReactions: currentPeriodStats.reactionCount,
        reactionGrowth,
        engagementRate: this.calculateEngagementRate(
          currentPeriodStats.reactionCount + currentPeriodStats.commentCount,
          currentPeriodStats.postCount
        ),
        activeMembers: currentPeriodStats.activeMembers,
      },
      memberGrowthData,
      activityData,
      contentTypeBreakdown,
      topMembers: await this.getTopMembers(communityID),
      engagementMetrics: await this.getEngagementMetricsData(communityID)
    };
  }

  async getMemberAnalytics(communityID: string, query: AnalyticsQueryDto) {
    const [
      memberStats,
      memberGrowth,
      memberActivityBreakdown,
      topContributors
    ] = await Promise.all([
      this.getMemberStats(communityID),
      this.getMemberGrowthData(communityID),
      this.getMemberActivityBreakdown(communityID),
      this.getTopContributors(communityID)
    ]);

    return {
      stats: memberStats,
      growth: memberGrowth,
      activityBreakdown: memberActivityBreakdown,
      topContributors
    };
  }

  async getEngagementMetrics(communityID: string, query: AnalyticsQueryDto) {
    const engagementTrends = await this.getEngagementTrends(communityID);
    const postPerformance = await this.getPostPerformanceData(communityID);
    const memberEngagement = await this.getMemberEngagementData(communityID);

    return {
      trends: engagementTrends,
      postPerformance,
      memberEngagement,
      averageEngagementRate: await this.getAverageEngagementRate(communityID),
      peakActivityHours: await this.getPeakActivityHours(communityID)
    };
  }

  async getContentAnalytics(communityID: string, query: AnalyticsQueryDto) {
    const [
      contentBreakdown,
      topPosts,
      contentTrends,
      mediaUsage
    ] = await Promise.all([
      this.getContentTypeBreakdown(communityID),
      this.getTopPosts(communityID),
      this.getContentTrends(communityID),
      this.getMediaUsageStats(communityID)
    ]);

    return {
      contentBreakdown,
      topPosts,
      contentTrends,
      mediaUsage
    };
  }

  async getCommunitiesOverview(query: AnalyticsQueryDto) {
    const [
      totalStats,
      growthStats,
      typeDistribution,
      topCommunities
    ] = await Promise.all([
      this.getTotalCommunitiesStats(),
      this.getCommunitiesGrowthStats(),
      this.getCommunityTypeDistribution(),
      this.getTopCommunities()
    ]);

    return {
      totalStats,
      growthStats,
      typeDistribution,
      topCommunities
    };
  }

  private async getCommunityInfo(communityID: string) {
    return this.prisma.community.findUnique({
      where: { id: communityID },
      select: {
        id: true,
        name: true,
        type: true,
        memberCount: true,
        postCount: true,
        createdAt: true
      }
    });
  }

  private async getCommunityStats(communityID: string, startDate: Date, endDate: Date) {
    const [memberCount, posts, comments, reactions, activeMembers] = await Promise.all([
      this.prisma.communityMember.count({
        where: {
          communityID,
          status: 'active',
          joinedAt: { gte: startDate, lte: endDate }
        }
      }),
      this.prisma.post.findMany({
        where: {
          communityID,
          createdAt: { gte: startDate, lte: endDate }
        },
        select: { id: true }
      }),
      this.prisma.postComment.count({
        where: {
          post: { communityID },
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      this.prisma.postReaction.count({
        where: {
          post: { communityID },
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      this.prisma.communityMember.count({
        where: {
          communityID,
          status: 'active',
          lastActiveAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    return {
      memberCount,
      postCount: posts.length,
      commentCount: comments,
      reactionCount: reactions,
      activeMembers
    };
  }

  private async getMemberGrowthData(communityID: string) {
    // const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const growthData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

      const [totalMembers, newMembers] = await Promise.all([
        this.prisma.communityMember.count({
          where: {
            communityID,
            status: 'active',
            joinedAt: { lte: endOfDay }
          }
        }),
        this.prisma.communityMember.count({
          where: {
            communityID,
            status: 'active',
            joinedAt: { gte: startOfDay, lte: endOfDay }
          }
        })
      ]);

      growthData.push({
        date: date.toISOString().split('T')[0],
        members: totalMembers,
        newMembers
      });
    }

    return growthData;
  }

  private async getActivityData(communityID: string) {
    // const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const activityData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

      const [posts, comments, reactions] = await Promise.all([
        this.prisma.post.count({
          where: {
            communityID,
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        }),
        this.prisma.postComment.count({
          where: {
            post: { communityID },
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        }),
        this.prisma.postReaction.count({
          where: {
            post: { communityID },
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        })
      ]);

      activityData.push({
        date: date.toISOString().split('T')[0],
        posts,
        comments,
        reactions
      });
    }

    return activityData;
  }

  private async getContentTypeBreakdown(communityID: string) {
    const posts = await this.prisma.post.groupBy({
      by: ['type'],
      where: { communityID },
      _count: { type: true }
    });

    const total = posts.reduce((sum, post) => sum + post._count.type, 0);

    return posts.map(post => ({
      type: post.type.charAt(0).toUpperCase() + post.type.slice(1),
      count: post._count.type,
      percentage: Math.round((post._count.type / total) * 100 * 100) / 100
    }));
  }

  private async getTopMembers(communityID: string) {
    const members = await this.prisma.communityMember.findMany({
      where: {
        communityID,
        status: 'active'
      },
      take: 10,/*
      include: {
        _count: {
          select: {
            // We'll need to add relations for posts and comments
          }
        }
      },*/
      orderBy: { joinedAt: 'asc' }
    });

    // For now, return mock data structure
    return members.map((member, index) => ({
      id: member.id,
      name: `${member.userType} ${member.userID}`, // You'll need to join with actual user tables
      posts: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 100),
      reactions: Math.floor(Math.random() * 200),
      score: Math.floor(Math.random() * 350)
    }));
  }

  private async getEngagementMetricsData(communityID: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalPosts, totalMembers, totalComments, totalReactions, activeUsers] = await Promise.all([
      this.prisma.post.count({
        where: {
          communityID,
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      this.prisma.communityMember.count({
        where: {
          communityID,
          status: 'active'
        }
      }),
      this.prisma.postComment.count({
        where: {
          post: { communityID },
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      this.prisma.postReaction.count({
        where: {
          post: { communityID },
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      this.prisma.communityMember.count({
        where: {
          communityID,
          status: 'active',
          lastActiveAt: { gte: thirtyDaysAgo }
        }
      })
    ]);

    const postsPerMember = totalMembers > 0 ? Math.round((totalPosts / totalMembers) * 100) / 100 : 0;
    const commentsPerPost = totalPosts > 0 ? Math.round((totalComments / totalPosts) * 100) / 100 : 0;
    const reactionsPerPost = totalPosts > 0 ? Math.round((totalReactions / totalPosts) * 100) / 100 : 0;

    return [
      { metric: 'Posts per Member', value: postsPerMember, change: 8.3 },
      { metric: 'Comments per Post', value: commentsPerPost, change: 12.1 },
      { metric: 'Reactions per Post', value: reactionsPerPost, change: 18.5 },
      { metric: 'Daily Active Users', value: activeUsers, change: 15.2 }
    ];
  }

  private calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 100) / 100;
  }

  private calculateEngagementRate(engagements: number, posts: number): number {
    if (posts === 0) return 0;
    return Math.round((engagements / posts) * 100 * 100) / 100;
  }

  // Additional helper methods would go here...
  private async getMemberStats(communityID: string) {
    // Implementation for member stats
    return {};
  }

  private async getMemberActivityBreakdown(communityID: string) {
    // Implementation for member activity breakdown
    return {};
  }

  private async getTopContributors(communityID: string) {
    // Implementation for top contributors
    return [];
  }

  private async getEngagementTrends(communityID: string) {
    // Implementation for engagement trends
    return [];
  }

  private async getPostPerformanceData(communityID: string) {
    // Implementation for post performance data
    return {};
  }

  private async getMemberEngagementData(communityID: string) {
    // Implementation for member engagement data
    return {};
  }

  private async getAverageEngagementRate(communityID: string) {
    // Implementation for average engagement rate
    return 0;
  }

  private async getPeakActivityHours(communityID: string) {
    // Implementation for peak activity hours
    return [];
  }

  private async getTopPosts(communityID: string) {
    // Implementation for top posts
    return [];
  }

  private async getContentTrends(communityID: string) {
    // Implementation for content trends
    return [];
  }

  private async getMediaUsageStats(communityID: string) {
    // Implementation for media usage stats
    return {};
  }

  private async getTotalCommunitiesStats() {
    // Implementation for total communities stats
    return {};
  }

  private async getCommunitiesGrowthStats() {
    // Implementation for communities growth stats
    return {};
  }

  private async getCommunityTypeDistribution() {
    // Implementation for community type distribution
    return [];
  }

  private async getTopCommunities() {
    // Implementation for top communities
    return [];
  }
}
