import { Injectable, Logger } from "@nestjs/common";
import { EventBusService } from "@nlc-ai/api-messaging";
import { PrismaService } from "@nlc-ai/api-database";

@Injectable()
export class ContentHandler {
  private readonly logger = new Logger(ContentHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly prisma: PrismaService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    // Listen for content sync completion from content service
    await this.eventBus.subscribe(
      'integrations-service.content-sync-completion',
      ['content.sync.completed'],
      this.handleContentSyncCompleted.bind(this)
    );

    await this.eventBus.subscribe(
      'integrations-service.content-sync-failure',
      ['content.sync.failed'],
      this.handleContentSyncFailed.bind(this)
    );
  }

  private async handleContentSyncCompleted(event: any) {
    try {
      const { integrationID, syncResult, completedAt } = event.payload;

      this.logger.log(`Content sync completed for integration ${integrationID}. Added ${syncResult.newContentAdded} pieces.`);

      // Update integration config with content sync results
      const integration = await this.prisma.integration.findUnique({
        where: { id: integrationID }
      });

      if (integration) {
        await this.prisma.integration.update({
          where: { id: integrationID },
          data: {
            config: {
              ...(integration as any).config,
              contentSync: {
                lastSync: completedAt,
                totalVideos: syncResult.totalProcessed,
                newVideosAdded: syncResult.newContentAdded,
                categorization: syncResult.categorized,
                errors: syncResult.errors
              }
            }
          }
        });
      }

    } catch (error: any) {
      this.logger.error(`Failed to handle content sync completion for integration ${event.payload.integrationID}:`, error);
    }
  }

  private async handleContentSyncFailed(event: any) {
    try {
      const { integrationID, error, failedAt } = event.payload;

      this.logger.error(`Content sync failed for integration ${integrationID}: ${error}`);

      // Update integration with content sync error
      const integration = await this.prisma.integration.findUnique({
        where: { id: integrationID }
      });

      if (integration) {
        await this.prisma.integration.update({
          where: { id: integrationID },
          data: {
            config: {
              ...(integration as any).config,
              contentSync: {
                lastSyncAttempt: failedAt,
                lastError: error
              }
            }
          }
        });
      }

    } catch (error: any) {
      this.logger.error(`Failed to handle content sync failure for integration ${event.payload.integrationID}:`, error);
    }
  }
}
