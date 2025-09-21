import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { CalendlyService } from "./services/apps/calendly.service";
import { EncryptionService } from "./services/encryption.service";
import { FacebookService } from "./services/social/facebook.service";
import { GmailService } from "./services/apps/gmail.service";
import { InstagramService } from "./services/social/instagram.service";
import { OutlookService } from "./services/apps/outlook.service";
import { TiktokService } from "./services/social/tiktok.service";
import { TokenManagementService } from "./services/token-management.service";
import { TwitterService } from "./services/social/twitter.service";
import { YoutubeService } from "./services/social/youtube.service";
import { StateTokenService } from "./services/state-token.service";
import { IntegrationFactory } from "./factories/integration.factory";
import {IntegrationsService} from "./integrations.service";

@Module({
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    EncryptionService,
    StateTokenService,
    TokenManagementService,
    CalendlyService,
    FacebookService,
    GmailService,
    InstagramService,
    OutlookService,
    TiktokService,
    TwitterService,
    YoutubeService,
    IntegrationFactory,
  ],
  exports: [
    IntegrationFactory,
    IntegrationsService
  ],
})
export class IntegrationsModule {}
