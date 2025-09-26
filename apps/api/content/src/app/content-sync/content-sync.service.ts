import { Injectable } from '@nestjs/common';
import { Integration } from '@nlc-ai/api-types';
import { YouTubeContentSyncService } from './services/apps/youtube.service';
import { InstagramContentSyncService } from './services/apps/instagram.service';
import { ContentSyncResult } from './services/abstract-content-sync.service';

@Injectable()
export class ContentSyncService {
  constructor(
    private readonly youtubeSync: YouTubeContentSyncService,
    private readonly instagramSync: InstagramContentSyncService
    // Add other platform sync services here as needed
  ) {}

  async syncContent(integration: Integration, platform: string): Promise<ContentSyncResult> {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return this.youtubeSync.syncYouTubeContent(integration);

      case 'instagram':
        return this.instagramSync.syncInstagramContent(integration);

      case 'tiktok':
        // TODO: Implement TikTok sync service
        throw new Error('TikTok content sync not yet implemented');

      case 'twitter':
        // TODO: Implement Twitter sync service
        throw new Error('Twitter content sync not yet implemented');

      case 'facebook':
        // TODO: Implement Facebook sync service
        throw new Error('Facebook content sync not yet implemented');

      default:
        throw new Error(`Unsupported platform for content sync: ${platform}`);
    }
  }

  getSupportedPlatforms(): string[] {
    return ['youtube', 'instagram']; // Add more as implemented
  }

  isPlatformSupported(platform: string): boolean {
    return this.getSupportedPlatforms().includes(platform.toLowerCase());
  }
}
