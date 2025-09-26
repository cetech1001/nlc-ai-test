import { Module } from '@nestjs/common';
import { ContentCategorizationService } from './services/content-categorization.service';
import { ContentSyncService } from './content-sync.service';
import { YouTubeContentSyncService } from './services/apps/youtube.service';
import { InstagramContentSyncService } from './services/apps/instagram.service';

@Module({
  providers: [
    ContentCategorizationService,
    ContentSyncService,
    YouTubeContentSyncService,
    InstagramContentSyncService,
  ],
  exports: [
    ContentCategorizationService,
    ContentSyncService,
    YouTubeContentSyncService,
    InstagramContentSyncService,
  ],
})
export class ContentSyncModule {}
