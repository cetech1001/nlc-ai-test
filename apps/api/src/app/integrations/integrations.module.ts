import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import {CalendlyService} from "./services/calendly.service";
import {EncryptionService} from "./services/encryption.service";
import {FacebookService} from "./services/facebook.service";
import {GmailService} from "./services/gmail.service";
import {InstagramService} from "./services/instagram.service";
import {LinkedinService} from "./services/linkedin.service";
import {OutlookService} from "./services/outlook.service";
import {TiktokService} from "./services/tiktok.service";
import {TokenManagementService} from "./services/token-management.service";
import {TwitterService} from "./services/twitter.service";
import {YoutubeService} from "./services/youtube.service";

@Module({
  controllers: [IntegrationsController],
  providers: [
    CalendlyService,
    EncryptionService,
    FacebookService,
    GmailService,
    InstagramService,
    LinkedinService,
    OutlookService,
    TiktokService,
    TokenManagementService,
    TwitterService,
    YoutubeService,
  ],
})
export class IntegrationsModule {}
