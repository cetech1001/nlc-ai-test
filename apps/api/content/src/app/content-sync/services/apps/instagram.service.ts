import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ContentCategorizationService } from '../content-categorization.service';
import { AbstractContentSyncService, PlatformContent } from '../abstract-content-sync.service';
import { Integration } from '@nlc-ai/api-types';

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  permalink: string;
}

@Injectable()
export class InstagramContentSyncService extends AbstractContentSyncService {
  constructor(
    prisma: PrismaService,
    categorizationService: ContentCategorizationService
  ) {
    super(prisma, categorizationService);
  }

  protected async fetchPlatformContent(integration: Integration): Promise<PlatformContent[]> {
    const accessToken = integration.accessToken;
    const igAccountID = integration.config?.igAccountID;

    if (!accessToken || !igAccountID) {
      throw new Error('Missing Instagram access token or account ID');
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountID}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&access_token=${encodeURIComponent(accessToken)}`
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Instagram API error: ${error}`);
      }

      const data: any = await response.json();
      const mediaItems: InstagramMedia[] = data.data || [];

      // Convert Instagram media to PlatformContent format
      return mediaItems.map(media => ({
        id: media.id,
        title: this.extractTitleFromCaption(media.caption),
        description: media.caption,
        tags: this.extractHashtagsFromCaption(media.caption),
        url: media.permalink,
        thumbnailUrl: media.thumbnail_url || media.media_url,
        publishedAt: new Date(media.timestamp),
        views: 0, // Instagram doesn't provide view count for posts
        likes: media.like_count || 0,
        comments: media.comments_count || 0,
        shares: 0, // Instagram doesn't provide share count
        durationSeconds: media.media_type === 'VIDEO' ? null : undefined,
        platform: 'instagram'
      }));

    } catch (error: any) {
      throw new Error(`Failed to fetch Instagram media: ${error.message}`);
    }
  }

  protected calculateEngagementRate(content: PlatformContent): number {
    // For Instagram, we'll use a different calculation since views aren't available
    // We'll estimate based on likes and comments relative to follower count
    const likes = content.likes || 0;
    const comments = content.comments || 0;

    // This is a simplified calculation - in reality you'd want to factor in follower count
    const engagements = likes + (comments * 3); // Weight comments more heavily
    return Number((engagements * 0.1).toFixed(2)); // Simplified engagement rate
  }

  /**
   * Public method to sync Instagram content specifically
   */
  async syncInstagramContent(integration: Integration) {
    return this.syncContent(integration, 'instagram');
  }

  /**
   * Extract a title from Instagram caption (first line or first sentence)
   */
  private extractTitleFromCaption(caption?: string): string {
    if (!caption) return 'Instagram Post';

    // Take first line or first 100 characters, whichever is shorter
    const firstLine = caption.split('\n')[0];
    const title = firstLine.length > 100 ? firstLine.substring(0, 97) + '...' : firstLine;

    return title || 'Instagram Post';
  }

  /**
   * Extract hashtags from Instagram caption
   */
  private extractHashtagsFromCaption(caption?: string): string[] {
    if (!caption) return [];

    const hashtagRegex = /#[\w]+/g;
    const hashtags = caption.match(hashtagRegex) || [];

    return hashtags.map(tag => tag.substring(1)); // Remove the # symbol
  }
}
