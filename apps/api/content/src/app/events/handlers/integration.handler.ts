import { Injectable, Logger } from "@nestjs/common";
import {EventBusService, OutboxService} from "@nlc-ai/api-messaging";
import {ContentSyncService} from "../../content-sync/content-sync.service";
import {ContentCategorizationService} from "../../content-sync/services/content-categorization.service";

@Injectable()
export class IntegrationHandler {
  private readonly logger = new Logger(IntegrationHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly outbox: OutboxService,
    private readonly contentSyncService: ContentSyncService,
    private readonly categorizationService: ContentCategorizationService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'content-service.integration-sync',
      ['integration.sync.requested'],
      this.handleIntegrationSyncRequested.bind(this)
    );

    await this.eventBus.subscribe(
      'content-service.content-analysis',
      ['content.analysis.requested'],
      this.handleContentAnalysisRequested.bind(this)
    );

    await this.eventBus.subscribe(
      'content-service.categorization',
      ['content.categorization.requested'],
      this.handleContentCategorizationRequested.bind(this)
    );
  }

  private async handleIntegrationSyncRequested(event: any) {
    try {
      const { integration, platform } = event.payload;
      this.logger.log(`Processing content sync for ${platform} integration: ${integration.id}`);

      let syncResult = await this.contentSyncService.syncContent(integration, platform);

      await this.outbox.saveAndPublishEvent({
        eventType: 'content.sync.completed',
        // @ts-ignore
        payload: {
          integrationID: integration.id,
          userID: integration.userID,
          userType: integration.userType,
          platform,
          syncResult,
          completedAt: new Date().toISOString(),
        },
        schemaVersion: 1,
      }, 'content.sync.completed');

      this.logger.log(`Content sync completed for ${platform}. Added ${syncResult.newContentAdded} new pieces.`);

    } catch (error: any) {
      this.logger.error(`Failed to sync content for integration ${event.payload.integration?.id}:`, error);

      // Publish sync failure event
      await this.outbox.saveAndPublishEvent({
        eventType: 'content.sync.failed',
        // @ts-ignore
        payload: {
          integrationID: event.payload.integration?.id,
          userID: event.payload.integration?.userID,
          userType: event.payload.integration?.userType,
          platform: event.payload.platform,
          error: error.message,
          failedAt: new Date().toISOString(),
        },
        schemaVersion: 1,
      }, 'content.sync.failed');
    }
  }

  private async handleContentAnalysisRequested(event: any) {
    try {
      const { contentPieceID } = event.payload;
      this.logger.log(`Processing content analysis for piece: ${contentPieceID}`);

      // Future: Implement AI-powered content analysis
      // - Performance prediction
      // - Sentiment analysis
      // - Content optimization suggestions
      // - Trend analysis

      this.logger.log(`Content analysis completed for piece: ${contentPieceID}`);

    } catch (error: any) {
      this.logger.error(`Failed to analyze content piece ${event.payload.contentPieceID}:`, error);
    }
  }

  private async handleContentCategorizationRequested(event: any) {
    try {
      const { contentPieceID, title, description, tags } = event.payload;
      this.logger.log(`Processing categorization for content piece: ${contentPieceID}`);

      const categoryResult = await this.categorizationService.categorizeVideo({
        title,
        description,
        tags
      });

      // Publish categorization result
      await this.outbox.saveAndPublishEvent({
        eventType: 'content.categorization.completed',
        // @ts-ignore
        payload: {
          contentPieceID,
          categoryResult,
          categorizedAt: new Date().toISOString(),
        },
        schemaVersion: 1,
      }, 'content.categorization.completed');

      this.logger.log(`Content categorization completed for piece: ${contentPieceID}`);

    } catch (error: any) {
      this.logger.error(`Failed to categorize content piece ${event.payload.contentPieceID}:`, error);
    }
  }
}
