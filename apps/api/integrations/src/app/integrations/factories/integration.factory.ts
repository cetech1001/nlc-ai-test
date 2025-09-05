import { BadRequestException, Injectable } from "@nestjs/common";
import { IntegrationType, IntegrationProvider } from "@nlc-ai/api-types";

import { YoutubeService } from "../services/social/youtube.service";
import { FacebookService } from "../services/social/facebook.service";
import { InstagramService } from "../services/social/instagram.service";
import { TwitterService } from "../services/social/twitter.service";
import { TiktokService } from "../services/social/tiktok.service";
import { CalendlyService } from "../services/apps/calendly.service";
import { GmailService } from "../services/apps/gmail.service";
import { OutlookService } from "../services/apps/outlook.service";

@Injectable()
export class IntegrationFactory {
  private providers = new Map<string, IntegrationProvider>();

  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly facebookService: FacebookService,
    private readonly instagramService: InstagramService,
    private readonly twitterService: TwitterService,
    private readonly tiktokService: TiktokService,
    private readonly calendlyService: CalendlyService,
    private readonly gmailService: GmailService,
    private readonly outlookService: OutlookService,
  ) {
    this.registerProviders();
  }

  private registerProviders() {
    this.providers.set('youtube', this.youtubeService);
    this.providers.set('facebook', this.facebookService);
    this.providers.set('instagram', this.instagramService);
    this.providers.set('twitter', this.twitterService);
    this.providers.set('tiktok', this.tiktokService);

    this.providers.set('calendly', this.calendlyService);
    this.providers.set('gmail', this.gmailService);
    this.providers.set('outlook', this.outlookService);
  }

  getProvider(platform: string): IntegrationProvider {
    const provider = this.providers.get(platform);
    if (!provider) {
      throw new BadRequestException(`Unsupported platform: ${platform}`);
    }
    return provider;
  }

  getProvidersByType(type: IntegrationType): IntegrationProvider[] {
    return Array.from(this.providers.values())
      .filter(provider => provider.integrationType === type);
  }

  getSupportedPlatforms(): string[] {
    return Array.from(this.providers.keys());
  }

  getSocialPlatforms(): string[] {
    return this.getProvidersByType(IntegrationType.SOCIAL).map(provider => provider.platformName);
  }

  getAppPlatforms(): string[] {
    return this.getProvidersByType(IntegrationType.APP).map(provider => provider.platformName);
  }

  getCoursePlatforms(): string[] {
    return this.getProvidersByType(IntegrationType.COURSE).map(provider => provider.platformName);
  }
}
