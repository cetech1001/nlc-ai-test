import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { ContentCategorizationService } from './content-categorization.service';
import { Integration } from '@nlc-ai/api-types';

export interface ContentSyncResult {
  totalProcessed: number;
  newContentAdded: number;
  categorized: { [categoryName: string]: number };
  errors: string[];
}

export interface PlatformContent {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  url: string;
  thumbnailUrl?: string;
  publishedAt: Date;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  durationSeconds?: number | null;
  platform: string;
}

@Injectable()
export abstract class AbstractContentSyncService {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly categorizationService: ContentCategorizationService
  ) {}

  /**
   * Abstract method to fetch content from platform API
   */
  protected abstract fetchPlatformContent(integration: Integration): Promise<PlatformContent[]>;

  /**
   * Abstract method to calculate engagement rate for the platform
   */
  protected abstract calculateEngagementRate(content: PlatformContent): number;

  /**
   * Main sync method that can be used by all platform implementations
   */
  async syncContent(integration: Integration, platform: string): Promise<ContentSyncResult> {
    const result: ContentSyncResult = {
      totalProcessed: 0,
      newContentAdded: 0,
      categorized: {},
      errors: []
    };

    try {
      // Get all content from platform API
      const platformContent = await this.fetchPlatformContent(integration);
      result.totalProcessed = platformContent.length;

      // Get existing content pieces to avoid duplicates
      const existingContent = await this.prisma.contentPiece.findMany({
        where: {
          coachID: integration.userID,
          platform: platform
        },
        select: { platformID: true }
      });

      const existingPlatformIDs = new Set(existingContent.map(c => c.platformID));

      // Process each piece of content
      for (const content of platformContent) {
        if (existingPlatformIDs.has(content.id)) {
          continue; // Skip already synced content
        }

        try {
          await this.syncSingleContent(integration, content, result);
        } catch (error: any) {
          result.errors.push(`Failed to process ${content.title}: ${error.message}`);
        }
      }

    } catch (error: any) {
      result.errors.push(`Failed to sync ${platform} content: ${error.message}`);
    }

    return result;
  }

  /**
   * Sync a single piece of content with categorization
   */
  private async syncSingleContent(
    integration: Integration,
    content: PlatformContent,
    result: ContentSyncResult
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Categorize the content
      const categoryResult = await this.categorizationService.categorizeVideo({
        title: content.title,
        description: content.description,
        tags: content.tags || []
      });

      // Ensure category exists
      const categoryID = await this.categorizationService.ensureCategoryExists(
        integration.userID,
        categoryResult.categoryName
      );

      // Create content piece
      await tx.contentPiece.create({
        data: {
          coachID: integration.userID,
          categoryID: categoryID,
          title: content.title,
          contentType: this.getContentType(content.platform),
          platform: content.platform,
          platformID: content.id,
          url: content.url,
          description: content.description || null,
          tags: content.tags || [],
          thumbnailUrl: content.thumbnailUrl,
          durationSeconds: content.durationSeconds,
          views: content.views || 0,
          likes: content.likes || 0,
          comments: content.comments || 0,
          shares: content.shares || 0,
          engagementRate: this.calculateEngagementRate(content),
          status: 'published',
          publishedAt: content.publishedAt,
          aiAnalyzed: true
        }
      });

      result.newContentAdded++;
      result.categorized[categoryResult.categoryName] = (result.categorized[categoryResult.categoryName] || 0) + 1;
    });
  }

  /**
   * Map platform to content type
   */
  protected getContentType(platform: string): string {
    const mapping: { [key: string]: string } = {
      youtube: 'video',
      instagram: 'image',
      tiktok: 'video',
      twitter: 'post',
      facebook: 'post'
    };

    return mapping[platform] || 'post';
  }

  /**
   * Utility method to parse ISO 8601 duration to seconds
   */
  protected parseDuration(isoDuration: string): number {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
  }
}
