import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ContentCategorizationService } from '../content-categorization.service';
import { AbstractContentSyncService, PlatformContent } from '../abstract-content-sync.service';
import { Integration } from '@nlc-ai/api-types';

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      medium?: { url: string };
      high?: { url: string };
    };
    tags?: string[];
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
  contentDetails: {
    duration: string; // ISO 8601 duration format (PT4M13S)
  };
}

@Injectable()
export class YouTubeContentSyncService extends AbstractContentSyncService {
  constructor(
    prisma: PrismaService,
    categorizationService: ContentCategorizationService
  ) {
    super(prisma, categorizationService);
  }

  protected async fetchPlatformContent(integration: Integration): Promise<PlatformContent[]> {
    const accessToken = integration.accessToken;
    const channelID = integration.config?.id;

    if (!accessToken || !channelID) {
      throw new Error('Missing YouTube access token or channel ID');
    }

    const videos: YouTubeVideo[] = [];
    let nextPageToken = '';

    try {
      // Fetch videos in batches
      do {
        const url = new URL('https://www.googleapis.com/youtube/v3/search');
        url.searchParams.set('part', 'id');
        url.searchParams.set('channelId', channelID);
        url.searchParams.set('type', 'video');
        url.searchParams.set('order', 'date');
        url.searchParams.set('maxResults', '50');
        if (nextPageToken) url.searchParams.set('pageToken', nextPageToken);

        const searchResponse = await fetch(url.toString(), {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const searchData: any = await searchResponse.json();

        if (!searchResponse.ok) {
          throw new Error(`YouTube API error: ${searchData.error?.message || 'Unknown error'}`);
        }

        const videoIDs = searchData.items?.map((item: any) => item.id.videoId) || [];

        if (videoIDs.length > 0) {
          // Get detailed video information
          const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
          detailsUrl.searchParams.set('part', 'snippet,statistics,contentDetails');
          detailsUrl.searchParams.set('id', videoIDs.join(','));

          const detailsResponse = await fetch(detailsUrl.toString(), {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });

          const detailsData: any = await detailsResponse.json();

          if (detailsResponse.ok) {
            videos.push(...(detailsData.items || []));
          }
        }

        nextPageToken = searchData.nextPageToken || '';
      } while (nextPageToken && videos.length < 200); // Limit to 200 videos per sync

    } catch (error: any) {
      throw new Error(`Failed to fetch YouTube videos: ${error.message}`);
    }

    // Convert YouTube videos to PlatformContent format
    return videos.map(video => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      tags: video.snippet.tags || [],
      url: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url,
      publishedAt: new Date(video.snippet.publishedAt),
      views: video.statistics.viewCount ? parseInt(video.statistics.viewCount) : 0,
      likes: video.statistics.likeCount ? parseInt(video.statistics.likeCount) : 0,
      comments: video.statistics.commentCount ? parseInt(video.statistics.commentCount) : 0,
      shares: 0, // YouTube doesn't provide shares in API
      durationSeconds: this.parseDuration(video.contentDetails.duration),
      platform: 'youtube'
    }));
  }

  protected calculateEngagementRate(content: PlatformContent): number {
    const views = content.views || 0;
    const likes = content.likes || 0;
    const comments = content.comments || 0;

    if (views === 0) return 0;

    const engagements = likes + comments;
    return Number(((engagements / views) * 100).toFixed(2));
  }

  /**
   * Public method to sync YouTube content specifically
   */
  async syncYouTubeContent(integration: Integration) {
    return this.syncContent(integration, 'youtube');
  }
}
