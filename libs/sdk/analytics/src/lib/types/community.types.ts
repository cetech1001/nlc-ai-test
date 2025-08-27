export interface CommunityAnalytics {
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
  memberGrowthData: Array<{
    date: string;
    members: number;
    newMembers: number;
  }>;
  activityData: Array<{
    date: string;
    posts: number;
    comments: number;
    reactions: number;
  }>;
  contentTypeBreakdown: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  topMembers: Array<{
    id: string;
    name: string;
    posts: number;
    comments: number;
    reactions: number;
    score: number;
  }>;
  engagementMetrics: Array<{
    metric: string;
    value: number;
    change: number;
  }>;
}

export interface CommunityMemberAnalytics {
  stats: {
    totalMembers: number;
    activeMembers: number;
    newMembersThisMonth: number;
    churnedMembersThisMonth: number;
    averageEngagementScore: number;
  };
  growth: Array<{
    date: string;
    members: number;
    newMembers: number;
  }>;
  activityBreakdown: {
    activeMembers: number;
    inactiveMembers: number;
    moderators: number;
    newMembers: number;
  };
  topContributors: Array<{
    id: string;
    name: string;
    role: string;
    contributions: number;
    engagementScore: number;
  }>;
}

export interface CommunityEngagementMetrics {
  trends: Array<{
    date: string;
    engagementRate: number;
    posts: number;
    reactions: number;
    comments: number;
  }>;
  postPerformance: {
    averageReactions: number;
    averageComments: number;
    topPerformingPosts: Array<{
      id: string;
      content: string;
      author: string;
      reactions: number;
      comments: number;
      engagementScore: number;
    }>;
  };
  memberEngagement: {
    highlyEngaged: number;
    moderatelyEngaged: number;
    lowEngagement: number;
    inactive: number;
  };
  averageEngagementRate: number;
  peakActivityHours: Array<{
    hour: number;
    activity: number;
  }>;
}

export interface CommunityContentAnalytics {
  contentBreakdown: Array<{
    type: string;
    count: number;
    percentage: number;
    averageEngagement: number;
  }>;
  topPosts: Array<{
    id: string;
    content: string;
    author: string;
    type: string;
    reactions: number;
    comments: number;
    shares: number;
    createdAt: string;
  }>;
  contentTrends: Array<{
    date: string;
    textPosts: number;
    imagePosts: number;
    videoPosts: number;
    linkPosts: number;
  }>;
  mediaUsage: {
    totalMediaPosts: number;
    imagePostsCount: number;
    videoPostsCount: number;
    averageEngagementWithMedia: number;
  };
}

export interface CommunitiesOverview {
  totalStats: {
    totalCommunities: number;
    activeCommunities: number;
    totalMembers: number;
    totalPosts: number;
    averageMembersPerCommunity: number;
    averagePostsPerCommunity: number;
  };
  growthStats: {
    newCommunitiesThisMonth: number;
    memberGrowthRate: number;
    postGrowthRate: number;
  };
  typeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  topCommunities: Array<{
    id: string;
    name: string;
    type: string;
    memberCount: number;
    postCount: number;
    engagementRate: number;
  }>;
}
